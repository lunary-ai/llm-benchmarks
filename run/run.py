import sqlite3
import time
from termcolor import colored
import psycopg2
from queriers import together, cohere, openai_func, openrouter, ai21, alephalpha, hugchat_func, anthropic_func
import psycopg2.extras
import psycopg2.pool 

import os
from dotenv import load_dotenv
load_dotenv()

# Connect to database
PG_URI = os.environ.get("POSTGRES_URL")


# Create a connection pool with a minimum of 2 connections and 
#a maximum of 3 connections 
pool = psycopg2.pool.SimpleConnectionPool(2, 10, dsn=PG_URI)

#conn = psycopg2.connect(PG_URI)

conn = pool.getconn()

cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

def remove_end(s, suffix):
    if s.endswith(suffix):
        return s[:-len(suffix)]
    return s

# Fetch models
cursor.execute("SELECT * FROM models")
models = cursor.fetchall()

# Fetch prompts
cursor.execute("SELECT * FROM prompts WHERE selected = true")
prompts = cursor.fetchall()


def get_results():
    cursor.execute("SELECT * FROM results")
    results = cursor.fetchall()
    return results

def insert_result(modelId, promptId, result, duration, rate):
    cursor.execute(
        "INSERT INTO results (model, prompt, result, duration, rate) VALUES (%s, %s, %s, %s, %s)",
        (modelId, promptId, result, duration, rate)
    )
    conn.commit()
    pass

def check_if_results_exist(modelId, promptId):
    cursor.execute(
        "SELECT * FROM results WHERE model = %s AND prompt = %s LIMIT 1", (modelId, promptId)
    )
    results = cursor.fetchall()
    return len(results) > 0

def ask_prompt(prompt, model):
    exists = check_if_results_exist(model["id"], prompt["id"])

    if exists:
        print(f"Skipping {model['name']}, already got benchmark")
        return

    mapping = {
        "together": together,
        "cohere": cohere,   # Add these functions to the mapping once they are translated
        "openai": openai_func,
        "openrouter": openrouter,
        "ai21": ai21,
        "hugchat": hugchat_func,
        "anthropic": anthropic_func,
        # "alephalpha": alephalpha # TODO: get a working API key
    }

    querier = mapping.get(model["api"])

    if not querier:
        print(f"No querier for {model['api']}")
        return

    print(colored("------------------------------------", 'white'))
    print(colored(f"Querying {model['name']}", 'white'))
    print(colored(f"Prompt: {prompt['text']}", 'white'))
    print(colored("------------------------------------", 'white'))

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

        print(colored("------------------------------------", 'green'))
        print(colored(f"Result: {cleaned}", 'green'))
        print(colored(f"Took {duration*1000} ms ({chars_per_second} chars/s)", 'green'))
        print(colored("------------------------------------", 'green'))

        insert_result(model["id"], prompt["id"], cleaned, duration*1000, chars_per_second)

    except Exception as e:
        print(colored(f"Error querying {model['name']} ", 'red'), e)


total_benchmarks = len(models) * len(prompts)

print(colored(f"Running {total_benchmarks} benchmarks", 'blue'))

# Run prompts
for model in models:

    if model["type"] != "chat":
        # Skip non-chat models for now 
        continue

    for prompt in prompts:
        # if prompt["type"] != "code" and model["type"] == "code":
            # print("Skipping non-code benchmark for code model")
            # continue

        ask_prompt(prompt, model)

# Calculate scores
results = get_results()

#@agent(name="RateResult")
def rate_result(result):
    cursor.execute(
        "SELECT * FROM rubrics WHERE prompt = %s",
        (result["prompt"],)
    )
    rubrics = cursor.fetchall()

    has_rubrics = len(rubrics) > 0

    if not has_rubrics:
        return

    print(colored('---------------------------', 'white'))
    print(colored('----------RATING-----------', 'white'))
    print(colored('---------------------------', 'white'))
    print(colored(result["result"], 'cyan'))
    print(colored('---------------------------', 'white'))
    
    score = 0 

    for rubric in rubrics:

        print('Rubric: '+colored(rubric["grading"], 'magenta'))
        
        if result["result"].strip() == "":
            score = 0
        else:
            grading_text = (
                f'You help me grade the answer of chatbots by verifying that they match this condition: the answer {rubric["grading"]}. Note: the answer might be imcomplete, in which case do your best to assess based on what the full result would be. Your rating needs to be very strict: if I ask that the answer is *exactly* some string and it contains more than that, then it\'s invalid.\n\n'
                f'\n\n--START OF THE ANSWER--\n{result["result"]}\n--END OF THE ANSWER--\n\n'
                # f'Take a deep breath and explain step by step how you come to the conclusion.'
                # f'Finally, reply on the last line with YES if the following answer matches this condition (otherwies reply NO).'
                f'Reply with YES if the text between START and END matches exactly the above condition (otherwise reply NO).'
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
    if result["score"] is None:
        score = rate_result(result)

        if score is not None:
            cursor.execute(
                "UPDATE results SET score = %s WHERE id = %s",
                (score, result["id"])
            )
            conn.commit()

cursor.close()
conn.close()
