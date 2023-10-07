import Link from "next/link"
import "@/styles/globals.css"
import { Suspense } from "react"

export const metadata = {
  title: "LLMonitor Benchmarks",
  description: "Benchmarks and scoring of LLMs",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>LLMonitor Benchmarks</h1>

          <p style={{ margin: "16px 0" }}>
            <Link href="/">leaderboard</Link>
            {" | "}
            <Link href="/prompts">dataset</Link>
            {" | "}
            <Link href="/compare">compare</Link>
            {" | "}
            <Link href="/about">about</Link>
          </p>
          <br />

          <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
        </main>
        <footer>
          <br />
          <p>
            Credit:{" "}
            <a href="https://twitter.com/vincelwt" target="_blank">
              @vincelwt
            </a>{" "}
            /{" "}
            <a href="https://llmonitor.com" target="_blank">
              llmonitor
            </a>
          </p>
        </footer>
      </body>
    </html>
  )
}
