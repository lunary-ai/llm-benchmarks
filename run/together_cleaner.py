# This cleans up the results from the together API by removing the stop tokens, for some reason the API doesn't do this itself.

import psycopg2
import psycopg2.extras
import psycopg2.pool 
import os

from dotenv import load_dotenv
load_dotenv()

# Connect to database
PG_URI = os.environ.get("POSTGRES_URL")
conn = psycopg2.connect(PG_URI)
cur = conn.cursor()

# Execute the SQL query
cur.execute("SELECT result FROM results INNER JOIN models ON results.model = models.id WHERE models.api = 'together'")

# Fetch all the rows
rows = cur.fetchall()

str_array = ["<human>", "<human>:", "</bot>", "</s>", "<|end|>", "<|endoftext|>", "```\n```", "\nUser"]



for row in rows:
    for string in str_array:
        if string in row[0]:
            print("Found string: " + string)
            # Find the index of the string
            index = row[0].index(string)
            # Remove the string and everything after it
            new_result = row[0][:index].strip()
            # Update the result in the database
            print('===============================')
            print("Old result:" + row[0])
            print("New result:" + new_result)

            cur.execute("UPDATE results SET result = %s WHERE result = %s", (new_result, row[0]))

conn.commit()
conn.close()