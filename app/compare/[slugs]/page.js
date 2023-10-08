import db, { getModels } from "@/utils/db"

export default async function Comparison({ params }) {
  const { slugs } = params

  const [model1, model2] = slugs.split("-vs-")

  const models = await getModels()

  const model1Data = models.find((m) => m.slug === model1)
  const model2Data = models.find((m) => m.slug === model2)

  // Get the models' results from the DB,
  const results =
    await db`SELECT * FROM results INNER JOIN prompts ON results.prompt = prompts.id WHERE model = ${model1Data.id} OR model = ${model2Data.id}`

  // Group and convert to table data with: prompt text, model 1 result, model 2 result

  const tableData = results.reduce((acc, result) => {
    const prompt = result.text

    // If the prompt is not in the accumulator, add it
    if (!acc[prompt]) {
      acc[prompt] = {
        prompt,
      }
    }

    // Add the result to the prompt
    acc[prompt][result.model === model1Data.id ? "model1" : "model2"] = result

    return acc
  }, {})

  // Convert to array

  const tableDataArray = Object.values(tableData)

  return (
    <table style={{ maxWidth: 1200 }}>
      <thead>
        <tr>
          <th>Prompt</th>
          <th>{model1Data?.name}</th>
          <th>{model2Data?.name}</th>
        </tr>
      </thead>
      <tbody>
        {tableDataArray.map((row, i) => (
          <tr key={i}>
            <td>
              <pre>{row.prompt}</pre>
            </td>
            <td>
              <pre>{row.model1?.result?.trim()}</pre>
              <p>{row.model1 ? `Score: ${row.model1?.score}` : "Not rated"}</p>
            </td>
            <td>
              <pre>{row.model2?.result?.trim()}</pre>
              <p>{row.model2 ? `Score: ${row.model2?.score}` : "Not rated"}</p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
