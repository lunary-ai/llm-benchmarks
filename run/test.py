import requests
import json

response = requests.post(
  url="https://openrouter.ai/api/v1/chat/completions",
  headers={
    "HTTP-Referer": 'https://benchmarks.llmonitor.com', # To identify your app. Can be set to localhost for testing
    "Authorization": "Bearer " + "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"
  },
  data=json.dumps({
    "model": "mistralai/mistral-7b-instruct", # Optional
    "messages": [ 
      {"role": "user", "content": "What is the meaning of life?"}
    ]
  })
)


print(response.json())