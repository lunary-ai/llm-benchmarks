import getDB from "@/utils/getDB"
import Head from "next/head"
import Link from "next/link"

export const getStaticPaths = async () => {
  const db = await getDB()

  const prompts = await db.all(`SELECT * FROM prompts`)

  return {
    paths: prompts.map((prompt) => ({
      params: { slug: prompt.slug },
    })),
    fallback: false,
  }
}

export const getStaticProps = async (props) => {
  const db = await getDB()

  const slug = props.params.slug

  const prompt = await db.get(`SELECT * FROM prompts WHERE slug = ?`, [slug])

  // get results with their model (join)
  const results = await db.all(
    `SELECT * FROM results INNER JOIN models ON results.model = models.id WHERE prompt = ? ORDER BY models.name ASC`,
    [prompt.id]
  )

  return { props: { prompt, results } }
}

export default function Prompt({ prompt, results }) {
  return (
    <>
      <Head>
        <title>LLM Benchmark</title>
        <meta name="description" content={`Asking models: ${prompt.text}`} />
      </Head>
      <h3>Prompt asked:</h3>
      <br />
      <pre style={{ maxWidth: 800 }}>{prompt.text}</pre>
      <br />
      {prompt.note && <p>Note: {prompt.note}</p>}
      <br />
      <Link href="/">Back to home</Link>
      <br />
      <br />
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Answer</th>
            <th>Latency</th>
            <th>Chars / s</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, i) => (
            <tr key={i}>
              <td>
                <Link
                  href={`/model/${result.api_id
                    .split("/")
                    .pop()
                    .toLowerCase()}`}
                >
                  {result.name}
                </Link>
              </td>
              <td>
                <pre>{result.result.trim()}</pre>
              </td>
              <td>{result.duration}ms</td>
              <td>{result.rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <Link href="/">Back to home</Link>

      <br />
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
    </>
  )
}
