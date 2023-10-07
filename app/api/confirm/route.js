import jwt from "jsonwebtoken"
import db from "@/utils/db"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get("token")

  console.log("token", token)

  const { userId } = jwt.verify(token, process.env.JWT_SECRET)

  const [userObj] =
    await db`UPDATE users SET confirmed = true WHERE id = ${userId} RETURNING *`

  const longLivedToken = jwt.sign(
    {
      userId: userObj.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 1 month
    },
    process.env.JWT_SECRET
  )

  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": `token=${longLivedToken}; path=/; HttpOnly`,
      Location: `/prompts`,
    },
  })
}
