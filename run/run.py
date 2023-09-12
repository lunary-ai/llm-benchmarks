import sqlite3
import time

from queriers import together, cohere, openai_func, openrouter, ai21, alephalpha

db = sqlite3.connect("./database.db")
db.row_factory = sqlite3.Row

cursor = db.cursor()

def remove_end(s, suffix):
    if s.endswith(suffix):
        return s[:-len(suffix)]
    return s


# Fetch models
models = cursor.execute("SELECT * FROM models").fetchall()
models = [dict(model) for model in models]

# Fetch prompts
prompts = cursor.execute("SELECT * FROM prompts").fetchall()
prompts = [dict(prompt) for prompt in prompts]

def insert_result(modelId, promptId, result, duration, rate):
    cursor.execute(
        "INSERT INTO results (model, prompt, result, duration, rate) VALUES (?, ?, ?, ?, ?)",
        (modelId, promptId, result, duration, rate)
    )
    db.commit()
    pass

def check_if_results_exist(modelId, promptId):
    results = cursor.execute(
        "SELECT * FROM results WHERE model = ? AND prompt = ? LIMIT 1", (modelId, promptId)
    ).fetchall()
    return len(results) > 0

def ask_prompt(prompt, model):
    exists = check_if_results_exist(model["id"], prompt["id"])

    if exists:
        print("Skipping, already got benchmark")
        return

    mapping = {
        "together": together,
        "cohere": cohere,   # Add these functions to the mapping once they are translated
        "openai": openai_func,
        "openrouter": openrouter,
        "ai21": ai21,
        # "alephalpha": alephalpha # TODO: get a working API key
    }

    querier = mapping.get(model["api"])

    if not querier:
        print(f"No querier for {model['api']}")
        return

    print(f"Querying {model['name']}")

    start_time = time.time()

    try:
        response_text = querier(model, prompt)

        # Remove newlines and trailing spaces + stop sequence
        cleaned = response_text.strip()
        if prompt["stop"]:
            cleaned = remove_end(cleaned, prompt["stop"])

        end_time = time.time()

        duration = end_time - start_time
        chars_per_second = round(len(response_text) / duration, 2)

        print("------------------------------------")
        print(f"Result: {cleaned}")
        print(f"Took {duration*1000} ms ({chars_per_second} chars/s)")
        print("------------------------------------")

        insert_result(model["id"], prompt["id"], cleaned, duration*1000, chars_per_second)

    except Exception as e:
        print(f"Error querying {model['name']}", e)


total_benchmarks = len(models) * len(prompts)
print(f"Running {total_benchmarks} benchmarks")


for model in models:
    if model["type"] == "language":
        continue
    for prompt in prompts:
        if prompt["type"] != "code" and model["type"] == "code":
            print("Skipping non-code benchmark for code model")
            continue

        ask_prompt(prompt, model)

db.close() 