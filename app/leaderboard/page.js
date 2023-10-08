import db, { getModels } from "@/utils/db"
import Link from "next/link"

export default async function Leaderboard() {
  const [potentialPoints] = await db`SELECT SUM(points) as total FROM rubrics`

  const models = await getModels()
  return (
    <>
      <p>
        Traditional LLMs benchmarks have drawbacks: they quickly become part of
        training datasets and are hard to relate to in terms of real-world
        use-cases.
      </p>
      <p>
        I made this as an experiment to address these issues. Here, the dataset
        is dynamic (changes every week) and composed of crowdsourced real-world
        prompts.
      </p>
      <p>
        We then use GPT-4 to grade each model's response against a set of
        rubrics (more details on the about page). The prompt dataset is easily
        explorable.
      </p>
      <p>
        Everything is then stored in a Postgres database and this page shows the
        raw results.
      </p>

      <br />
      <table style={{ maxWidth: 600 }}>
        <thead>
          <tr>
            <th width={70}>Rank</th>
            <th width={250}>Model</th>
            <th>Score</th>
            <th>Results</th>
          </tr>
        </thead>
        <tbody>
          {models
            .filter((s) => s.total_score)
            .map((model, i) => (
              <tr key={i}>
                <td>{model.rank}</td>
                <td>{model.name}</td>
                <td>
                  {parseInt((model.total_score / potentialPoints.total) * 100)}
                </td>
                <td>
                  <Link
                    href={`/${model.api_id.split("/").pop().toLowerCase()}`}
                  >
                    view
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  )
}
