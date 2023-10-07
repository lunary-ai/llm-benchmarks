"use client"
import CaptchaInput from "@/components/CaptchaInput"
import { experimental_useFormState as useFormState } from "react-dom"
import { submitLogin } from "../actions"

export default function SignIn() {
  const [state, formAction] = useFormState(submitLogin, {})

  return (
    <form
      action={formAction}
      style={{ background: "rgba(0,0,0,0.1)", padding: 10 }}
    >
      <input
        required
        type="email"
        id="email"
        name="email"
        placeholder="Email"
      />
      <br />
      <br />
      <CaptchaInput />
      <br />
      <p>
        For anti-spam measure please confirm your email before upvoting or
        submitting prompts.
      </p>

      {state.error && (
        <p
          style={{
            color: "red",
          }}
        >
          {state.error}
        </p>
      )}

      {state.message && <p>{state.message}</p>}

      <input type="submit" value="Confirm email" />
    </form>
  )
}
