"use client"

import { useState } from "react"

export default function UpvoteBtn({ id }) {
  const [upvoted, setUpvoted] = useState(false)

  const upvote = async (id) => {
    const response = await fetch(`/api/upvote?prompt=${id}`)
    const data = await response.text()
    if (data === "ok") return setUpvoted(true)
    alert(data)
  }

  return (
    <a href="#" onClick={() => upvote(id)}>
      <small>{upvoted ? "Upvoted" : "Upvote"}</small>
    </a>
  )
}
