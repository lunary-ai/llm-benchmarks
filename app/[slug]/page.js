import db, { getModels } from "@/utils/db"

export default async function ModelResults({ params }) {
  const slug = params.slug

  const models = await getModels()

  const model = models.find((m) => m.slug === slug)

  const results = await db`
    SELECT results.*, prompts.text as prompt_text
    FROM results
    INNER JOIN prompts ON results.prompt = prompts.id
    WHERE model = ${model.id}
    ORDER BY results.score DESC;
    `

  return (
    <>
      <h3>{model.name}</h3>
      <p>Score: {model.total_score}</p>
      <table>
        <thead>
          <tr>
            <th width={400}>Prompt</th>
            <th width={500}>Result</th>
            <th width={150}>Rate</th>
            <th width={150}>Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, i) => (
            <tr key={i}>
              <td>
                <pre>{result.prompt_text}</pre>
              </td>
              <td>
                <pre>{result.result.trim()}</pre>
              </td>
              <td>{result.rate} char/s</td>
              <td>
                {typeof result.score === "number" ? result.score : "not rated"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
