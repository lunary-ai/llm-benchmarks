import getDB from "@/utils/getDB"
import Head from "next/head"
import Link from "next/link"
import { useMemo } from "react"

export const getStaticPaths = async () => {
  const db = await getDB()

  const models = await db.all(`SELECT * FROM models`)

  return {
    paths: models.map((model) => ({
      params: { id: model.api_id.split("/").pop().toLowerCase() },
    })),
    fallback: false,
  }
}

export const getStaticProps = async (props) => {
  const db = await getDB()

  const { id } = props.params

  console.log("id", id)

  // where api_id contains the id (it's in lowercase)
  const model = await db.get(`SELECT * FROM models WHERE api_id LIKE ?`, [
    `%${id}%`,
  ])

  // get all results for this model, with their prompt (join)
  const results = await db.all(
    `SELECT * FROM results INNER JOIN prompts ON results.prompt = prompts.id WHERE model = ? ORDER BY prompts.text DESC`,
    [model.id]
  )

  return { props: { results, model } }
}

export default function Prompt({ model, results }) {
  const medianRate = useMemo(() => {
    const rates = results.map((r) => r.rate)
    const sorted = rates.sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2
  }, [results])

  return (
    <>
      <Head>
        <title>
          {model.org} {model.name} benchmark across 20 prompts
        </title>
        <meta
          name="description"
          content={`Human-readable benchmark of ${model.org} ${model.name} across 20 prompts.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <h3>
        {model.org} {model.name}
      </h3>
      <p>Median output rate: {medianRate.toFixed(2)} chars / s</p>

      <br />
      <Link href="/">Back to home</Link>
      <br />
      <br />
      <table>
        <thead>
          <tr>
            <th>Prompt</th>
            <th>Answer</th>
            <th>Latency</th>
          </tr>
        </thead>
        <tbody>
          {results
            .sort((a, b) => a.name > b.name)
            .map((result) => (
              <tr>
                <td>
                  <pre>
                    {result.text}
                    <br />
                    <br />
                    <Link href={`/${result.slug}`}>all answers</Link>
                  </pre>
                </td>
                <td>
                  <pre>{result.result.trim()}</pre>
                </td>
                <td>{result.duration}ms</td>
              </tr>
            ))}
        </tbody>
      </table>
      <br />
      <Link href="/">Back to home</Link>
      <style jsx>{`
        th:nth-child(1) {
          width: 30%;
        }
      `}</style>
    </>
  )
}
