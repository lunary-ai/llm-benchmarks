import openai
import os
import json
import requests
from dotenv import load_dotenv

from llmonitor import monitor

load_dotenv()

TOGETHER_API_KEY = os.getenv('TOGETHER_API_KEY')
COHERE_API_KEY = os.getenv('COHERE_API_KEY')
AI21_API_KEY = os.getenv('AI21_API_KEY')
ALEPH_API_KEY = os.getenv('ALEPH_API_KEY')
OPEN_ROUTER_API_KEY = os.getenv('OPEN_ROUTER_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

MAX_TOKENS = 300

monitor(openai)

def together(model, params):
    def format_prompt(prompt, prompt_type):
      if prompt_type == "language":
          return f"Q: {prompt}\nA: "
      if prompt_type == "code":
          return f"# {prompt}"
      if prompt_type == "chat":
          return f"\n<human>: {prompt}\n<bot>: "
      
    url = "https://api.together.xyz/inference"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
    }

    data = {
        "model": model['api_id'],
        "prompt": format_prompt(params['text'], model['type']),
        "stop": params['stop'] if model['type'] == "chat" else params.get('stop', None),
        "temperature": 0,
        "max_tokens": MAX_TOKENS,
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    result = response.json()

    return result['output']['choices'][0]['text'].rstrip(params['stop'])

def cohere(model, params):
    options = {
        "method": "POST",
        "headers": {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {COHERE_API_KEY}",
        },
        "body": json.dumps({
            "max_tokens": MAX_TOKENS,
            "truncate": "END",
            "return_likelihoods": "NONE",
            "prompt": params['text'],
            "stop_sequences": [params['stop']] if params.get('stop') else [],
            "model": model['api_id'],
            "temperature": 0,
        }),
    }

    response = requests.post("https://api.cohere.ai/v1/generate", headers=options['headers'], data=options['body'])
    json_response = response.json()

    return json_response['generations'][0]['text']

def openai_func(model, params):
    
    openai.api_key = OPENAI_API_KEY

    completion = openai.ChatCompletion.create(
        model=model['api_id'],
        messages=[{"role": "user", "content": params['text']}],
        temperature=0,
        max_tokens=MAX_TOKENS,
        stop=[params['stop']] if params.get('stop') else []
    )
    
    return completion.choices[0].message.content

def ai21(model, params):
    options = {
        "headers": {
            "accept": "application/json",
            "content-type": "application/json",
            "Authorization": f"Bearer {AI21_API_KEY}",
        },
        "body": json.dumps({
            "prompt": params['text'],
            "maxTokens": MAX_TOKENS,
            "temperature": 0,
            "stopSequences": [params['stop']] if params.get('stop') else [],
        }),
    }

    response = requests.post(f"https://api.ai21.com/studio/v1/{model['api_id']}/complete", headers=options['headers'], data=options['body'])
    json_response = response.json()
    return json_response['completions'][0]['data']['text']

def openrouter(model, params):
    openai.api_key = OPEN_ROUTER_API_KEY
    openai.api_base ="https://openrouter.ai/api/v1"
    
    completion = openai.ChatCompletion.create(
        messages=[{"role": "user", "content": params['text']}],
        temperature=0,
        model=model['api_id'],
        max_tokens=MAX_TOKENS,
        headers={"HTTP-Referer": "https://benchmarks.llmonitor.com"},
        stop=[params['stop']] if params.get('stop') else []
    )
    
    return completion.choices[0].message.content

def alephalpha(model, params):
    options = {
        "headers": {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {ALEPH_API_KEY}",
        },
        "body": json.dumps({
            "model": model['api_id'],
            "prompt": params['text'],
            "maximum_tokens": MAX_TOKENS,
            "stop_sequences": [params['stop']] if params.get('stop') else [],
        }),
    }

    response = requests.post("https://api.aleph-alpha.com/complete", headers=options['headers'], data=options['body'])
    json_response = response.json()
    return json_response['completions'][0]['completion']

