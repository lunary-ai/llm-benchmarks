import db from "@/utils/db"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    const token = request.cookies.get("token")

    const searchParams = request.nextUrl.searchParams
    const prompt = searchParams.get("prompt")

    const { userId } = jwt.verify(token.value, process.env.JWT_SECRET)

    const [userObj] = await db`SELECT * FROM users WHERE id = ${userId}`
    if (!userObj) throw new Error("user not found")

    // insert vote for prompt

    const [vote] =
      await db`INSERT INTO votes ("user", prompt) VALUES (${userId}, ${prompt}) RETURNING *`

    return new Response("upvoted", {
      status: 200,
    })
  } catch (e) {
    return new Response(e.message, {
      status: 500,
    })
  }
}
