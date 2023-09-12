import PlausibleProvider from "next-plausible"

import "@/styles/globals.css"

export default function App({ Component, pageProps }) {
  return (
    <PlausibleProvider
      domain="benchmarks.llmonitor.com"
      scriptProps={{
        src: "https://llmonitor.com/p/js/script.js",
        // @ts-ignore
        "data-api": "https://llmonitor.com/p/event",
      }}
      customDomain="benchmarks.llmonitor.com"
    >
      <Component {...pageProps} />
      <footer>
        <br />
        <p>
          Credit:{" "}
          <a href="https://twitter.com/vincelwt" target="_blank">
            @vincelwt
          </a>
        </p>

        <a href="https://llmonitor.com" className="llmonitor" target="_blank">
          by 📈 llmonitor
        </a>
      </footer>
    </PlausibleProvider>
  )
}
