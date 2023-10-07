import Link from "next/link"
import db from "@/utils/db"

export default async function PromptDetails({ params }) {
  const { slug } = params

  const [prompt] = await db`SELECT * FROM prompts WHERE slug = ${slug}`

  // get results with their model (join)
  const results =
    await db`SELECT * FROM results INNER JOIN models ON results.model = models.id WHERE prompt = ${prompt.id} ORDER BY models.name ASC`

  console.log("results", results)

  const rubrics = await db`SELECT * FROM rubrics WHERE prompt = ${prompt.id}`

  return (
    <>
      <h3>Prompt asked:</h3>
      <br />
      <pre style={{ maxWidth: 800 }}>{prompt.text}</pre>
      <br />
      {prompt.note && <p>Note: {prompt.note}</p>}
      <br />

      <table>
        <thead>
          <tr>
            <th width={200}>Model</th>
            <th>Answer</th>
            <th width={150}>Latency</th>
            <th width={150}>Rate</th>
            <th width={150}>Score</th>
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
                <pre>{result.result.trim().substring(0, 1000)}</pre>
              </td>
              <td>{parseInt(result.duration)}ms</td>
              <td>{result.rate.toFixed(2)}</td>
              <td>
                {typeof result.score === "number" ? result.score : "not rated"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <pre>
        <p>This prompt is automatically graded using these rubrics:</p>
        <ul>
          {rubrics
            .sort((a, b) => a.grading - b.grading)
            .map((rubric, i) => (
              <li key={i}>
                the answer {rubric.grading} ({rubric.points} points)
              </li>
            ))}
        </ul>
      </pre>
    </>
  )
}
