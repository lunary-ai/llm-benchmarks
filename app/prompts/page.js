import db from "@/utils/db"
import Link from "next/link"

export default async function Dataset() {
  const prompts =
    await db`SELECT * FROM prompts WHERE selected = true ORDER BY text ASC `

  const types = Array.from(new Set(prompts.map((p) => p.type)))

  return (
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
                    <Link href={`/prompts/${prompt.slug}`}>results</Link>
                  </pre>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </>
  )
}
