import { cookies } from "next/headers"
import Link from "next/link"

export default function PromptsLayout({ children }) {
  const cookiesList = cookies()
  const token = cookiesList.get("token")

  return (
    <>
      <p>
        {"dataset menu: "}
        <Link href="/prompts">current dataset</Link> {" | "}
        <Link href="/prompts/new">vote</Link> {" | "}
        <Link href={!token ? "/login" : "/prompts/submit"}>submit</Link>
      </p>
      <br />
      {children}
    </>
  )
}
