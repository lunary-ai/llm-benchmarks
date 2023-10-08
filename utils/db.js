import postgres from "postgres"
import { cache } from "react"

const sql = postgres(process.env.POSTGRES_URL) // will use psql environment variables

export const getModels = cache(async () => {
  const models = await sql`
    SELECT models.*, SUM(results.score) as total_score
    FROM models
    LEFT JOIN results ON models.id = results.model
    GROUP BY models.id
    ORDER BY total_score DESC;
  `

  console.log("models", models)

  const sorted = models.sort((a, b) => b.total_score - a.total_score)

  // set the rank, so that if two models have the same score, they have the same rank
  for (let i = 0; i < sorted.length; i++) {
    const model = sorted[i]
    const previousModel = sorted[i - 1]

    if (previousModel && previousModel.total_score === model.total_score) {
      model.rank = previousModel.rank
    } else {
      model.rank = previousModel ? previousModel.rank + 1 : 1
    }

    model.slug = model.api_id.split("/").pop().toLowerCase()
  }

  return sorted
})

export default sql
