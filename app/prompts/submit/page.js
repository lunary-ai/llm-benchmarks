import db from "@/utils/db"
import { cookies } from "next/headers"

import Link from "next/link"
import { redirect } from "next/navigation"

import jwt from "jsonwebtoken"

export default async function Submit() {
  // Get user session token

  async function create(formData) {
    "use server"

    const cookiesList = cookies()
    const token = cookiesList.get("token")

    console.log("token", token)

    if (!token) throw new Error("not logged")

    const { userId } = jwt.verify(token.value, process.env.JWT_SECRET)

    const [userObj] = await db`SELECT * FROM users WHERE id = ${userId}`
    if (!userObj) throw new Error("user not found")

    const text = formData.get("prompt")
    const slug = formData.get("slug")

    if (text.length <= 20 || text.length > 1000)
      throw new Error("prompt too long or too short")

    const [prompt] =
      await db`INSERT INTO prompts (text, submitter, slug) VALUES (${text}, ${userObj.id}, ${slug}) RETURNING *`

    const [vote] =
      await db`INSERT INTO votes ("user", prompt) VALUES (${userObj.id}, ${prompt.id}) RETURNING *`

    redirect(`/prompts`)

    // send email to user to confirm submission
  }

  return (
    <>
      <p>Submit a new prompt to be included to the benchmark.</p>
      <p>
        Each week, the highest rated prompt will become part of the benchmark.
      </p>
      <p>What makes a good prompt:</p>
      <ul>
        <li>
          Can be broke down <Link href="/about">into rubrics</Link> & evaluated
        </li>
        <li>
          Is original and not popular on the internet (unlikely to be already
          part in the benchmark)
        </li>
        <li>Is not too long (max 1000 characters)</li>
      </ul>
      <br />

      <form action={create}>
        <table
          id="hnmain"
          border="0"
          cellPadding="0"
          cellSpacing="0"
          style={{ maxWidth: 680 }}
        >
          <tbody>
            <tr>
              <td>
                <label htmlFor="prompt">Prompt</label>
              </td>
              <td>
                <textarea
                  id="prompt"
                  name="prompt"
                  rows="10"
                  minLength={20}
                  maxLength={1000}
                  cols="50"
                  required
                />
              </td>
            </tr>
            <tr>
              <td>
                <label htmlFor="rubrics">Slug</label>
              </td>
              <td>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <p>
          To prevent spam, you will receive an email to confirm your submission.
        </p>

        <button type="submit">Submit</button>
      </form>
    </>
  )
}
