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

  return models.map((m) => ({
    ...m,
    slug: m.api_id.split("/").pop().toLowerCase(),
  }))
})

export default sql
