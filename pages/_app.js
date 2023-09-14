import PlausibleProvider from "next-plausible"

import "@/styles/globals.css"

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

        {/* Support embedding into HuggingFace */}
        <Script
          strategy="afterInteractive"
          src="https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.contentWindow.min.js"
        />
      </footer>
    </PlausibleProvider>
  )
}
