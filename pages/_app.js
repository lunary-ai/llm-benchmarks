import PlausibleProvider from "next-plausible"

import "@/styles/globals.css"
import Head from "next/head"
import Script from "next/script"

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
      <Head>
        {/* Support embedding into HuggingFace */}
        <Script
          strategy="afterInteractive"
          src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.contentWindow.min.js"
        />
      </Head>
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
