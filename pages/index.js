import getDB from "@/utils/getDB"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"

// import styles from '@/styles/Home.module.css'

export const getStaticProps = async () => {
  const db = await getDB()

  const prompts = await db.all(`SELECT * FROM prompts ORDER BY text ASC`)

  // get all models that have at least 1 result
  const models = await db.all(
    `SELECT * FROM models WHERE id IN (SELECT DISTINCT model FROM results) ORDER BY name ASC`
  )

  return { props: { prompts, models } }
}

export default function Home({ prompts, models }) {
  const router = useRouter()

  const [viewBy, setViewBy] = useState(router.query.viewBy || "prompt")

  const changeView = (viewBy) => {
    router.push({ query: { viewBy } })
  }

  useEffect(() => {
    if (router.query.viewBy) setViewBy(router.query.viewBy)
  }, [router.query.viewBy])

  const types = useMemo(() => {
    return Array.from(new Set(prompts.map((p) => p.type)))
  }, [prompts])

  return (
    <>
      <Head>
        <title>LLM Benchmarks</title>
        <meta
          name="description"
          content="Human-readable benchmarks of 60+ open-source and proprietary LLMs."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <h1>Asking 60+ LLMs a set of 20 questions</h1>
        <br />
        <p>
          Benchmarks like HellaSwag are a bit too abstract for me to get a sense
          of how well they perform in real-world workflows.
        </p>
        <br />

        <p>
          I had the idea of writing a script that asks prompts testing basic
          reasoning, instruction following, and creativity on around 60 models
          that I could get my hands on through inferences API.
        </p>
        <br />
        <p>
          The script stored all the answers in a SQLite database, and those are
          the raw results.
        </p>
        <br />

        <table style={{ maxWidth: 600 }}>
          <th>
            <p>
              Edit: as this got popular, I added an email form to receive
              notifications for future benchmark results:
            </p>
            <iframe
              src="https://embeds.beehiiv.com/65bd6af1-2dea-417a-baf2-b65bc27e1610?slim=true"
              height="52"
              frameborder="0"
              scrolling="no"
              style={{
                width: 400,
                border: "none",
                transform: "scale(0.8)",
                transformOrigin: "left",
              }}
            ></iframe>
            <br />
            <small>(no spam, max 1 email per month)</small>
          </th>
        </table>
        <br />
        <br />
        <p>
          {`view: `}
          <a href="#" onClick={() => changeView("prompt")}>
            all prompts
          </a>{" "}
          /{" "}
          <a href="#" onClick={() => changeView("model")}>
            all models
          </a>
        </p>
        <br />
        {viewBy === "prompt" ? (
          <>
            {types.map((type, k) => (
              <div key={k}>
                <p>{type}:</p>
                <br />
                <ul>
                  {prompts
                    .filter((p) => p.type === type)
                    .map((prompt, i) => (
                      <li key={i}>
                        <pre style={{ maxWidth: 800 }}>
                          {prompt.text}
                          <br />
                          <br />
                          <Link href={`/${prompt.slug}`}>results</Link>
                        </pre>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </>
        ) : (
          <ul>
            {models.map((model, i) => (
              <li key={i}>
                {model.name} -{" "}
                <Link
                  href={`/model/${model.api_id.split("/").pop().toLowerCase()}`}
                >
                  results
                </Link>
              </li>
            ))}
          </ul>
        )}
        <br />
        <br />
        <h3>Notes</h3>
        <br />
        <ul>
          <li>
            I used a temperature of 0 and a max token limit of 240 for each test
            (that's why a lot of answers are cropped). The rest are default
            settings.
          </li>
          <li>
            I made this with a mix of APIs from OpenRouter, TogetherAI, OpenAI,
            Cohere, Aleph Alpha & AI21.
          </li>
          <li>
            <b>This is imperfect.</b> I want to improve this by using better
            stop sequences and prompt formatting tailored to each model. But
            hopefully it can already make picking models a bit easier.
          </li>
          <li>
            Ideas for the future: public votes to compute an ELO rating, compare
            2 models side by side, community-submitted prompts (open to
            suggestions)
          </li>
          <li>
            Prompt suggestions, feedback or say hi: vince [at] llmonitor.com
          </li>
          <li>
            {`Shameless plug: I'm building an `}
            <a href="https://github.com/llmonitor/llmonitor" target="_blank">
              open-source observability tool for AI devs.
            </a>
          </li>
        </ul>
      </main>
    </>
  )
}
