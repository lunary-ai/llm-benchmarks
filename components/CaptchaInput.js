"use client"
import ReCAPTCHA from "react-google-recaptcha"
import { useState } from "react"

export default function CaptchaInput() {
  const [recaptchaValue, setRecaptchaValue] = useState(null)

  return (
    <>
      <input
        type="hidden"
        name="g-recaptcha-response"
        value={recaptchaValue || ""}
      />
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        onChange={(value) => setRecaptchaValue(value)}
      />
    </>
  )
}
