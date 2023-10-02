import sqlite3
import time
from termcolor import colored
from llmonitor import agent
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


def get_results():
    results = cursor.execute("SELECT * FROM results").fetchall()
    print(results[0].keys())
    return [dict(result) for result in results]

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

# # Run prompts
# for model in models:
#     if model["type"] == "language":
#         continue
#     for prompt in prompts:
#         if prompt["type"] != "code" and model["type"] == "code":
#             print("Skipping non-code benchmark for code model")
#             continue

#         ask_prompt(prompt, model)

# Calculate scores
results = get_results()

@agent(name="RateResult")
def rate_result(result):
    rubrics = cursor.execute(
        "SELECT * FROM rubrics WHERE prompt = ?",
        (result["prompt"],)
    ).fetchall()

    has_rubrics = len(rubrics) > 0

    if not has_rubrics:
        return

    print(colored('---------------------------', 'white'))
    print(colored('----------RATING-----------', 'white'))
    print(colored('---------------------------', 'white'))
    print(colored(result["result"], 'cyan'))
    print(colored('---------------------------', 'white'))
    
    score = None 

    for rubric in rubrics:

        print('Rubric: '+colored(rubric["grading"], 'magenta'))
        
        if result["result"].strip() == "":
            score = 0
        else:
            grading_text = (
                f'You help verify that the following answer match this condition: the answer {rubric["grading"]}. Note: the answer might be imcomplete, in which case do your best to assess based on what the full result would be.\n\n'
                f'\n\n--START OF THE ANSWER--\n{result["result"]}\n--END OF THE ANSWER--\n\n'
                f'Take a deep breath and explain step by step how you come to the conclusion.'
                f'Finally, reply on the last line with YES if the following answer matches this condition (otherwies reply NO).'
            )

            # get gpt-4 model
            gpt4 = next((item for item in models if item['api_id'] == 'gpt-4'), None)
            
            prompt = { }

            response_text = openai_func(gpt4, {"text": grading_text})

            print(colored(f"-> {response_text}", 'yellow'))

            last_line = response_text.splitlines()[-1]

            # If it includes a yes, then it's valid
            if "YES" in last_line:
                print(colored(f'Valid! + {rubric["points"]} points', 'green'))
                score = rubric["points"] if score is None else score + rubric["points"]

    print('Final score: '+colored(score, 'cyan'))
    
    return score



for result in results:
    if not result["score"]:
        score = rate_result(result)

        if score is not None:
            cursor.execute(
                "UPDATE results SET score = ? WHERE id == ?",
                (score, result["id"])
            )
            db.commit()

db.close() 