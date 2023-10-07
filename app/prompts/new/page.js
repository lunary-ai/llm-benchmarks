import UpvoteBtn from "@/components/UpvoteBtn"
import db from "@/utils/db"
import { cookies } from "next/headers"
import Link from "next/link"

export default async function Dataset() {
  const cookiesList = cookies()

  const logged = cookiesList.has("token")

  // get prompts with selected != true joined with sum of votes for each
  const promptsWithVotes =
    await db`SELECT prompts.*, COUNT(votes.id) AS votes FROM prompts LEFT JOIN votes ON prompts.id = votes.prompt WHERE prompts.selected IS NOT TRUE GROUP BY prompts.id ORDER BY votes DESC`

  return (
    <>
      <table
        border="0"
        cellPadding="0"
        cellSpacing="0"
        style={{ maxWidth: 600 }}
      >
        <tbody>
          {promptsWithVotes.map((prompt, i) => (
            <tr key={i}>
              <td width={30}>{i + 1}</td>
              <td>
                <span>{prompt.votes} points</span>
                <br />
                {logged ? (
                  <UpvoteBtn id={prompt.id} />
                ) : (
                  <Link href="/login">
                    <small>upvote</small>
                  </Link>
                )}
              </td>
              <td>
                <pre style={{ maxWidth: 800 }}>{prompt.text}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
