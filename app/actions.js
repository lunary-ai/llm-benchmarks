"use server"

import { sendEmail } from "@/utils/email"
import db from "@/utils/db"

import jwt from "jsonwebtoken"

export async function submitPrompt(prevState, formData) {
  try {
    // await createItem(formData.get('todo'))
    const prompt = formData.get("prompt")
    const email = formData.get("email")
    const recaptchaValue = formData.get("g-recaptcha-response")

    console.log({ prompt, email, recaptchaValue })

    return revalidatePath("/")
  } catch (e) {
    return { message: "Failed to create" }
  }
}

export async function submitLogin(prevState, formData) {
  const email = formData.get("email")
  const recaptcha = formData.get("g-recaptcha-response")

  // check captcha

  console.log({ email, recaptcha })

  const captchaResponse = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}`,
    }
  )
  const captchaData = await captchaResponse.json()

  console.log({ captchaData })
  if (!captchaData.success) {
    console.log("failed captcha")
    return { error: "Failed to verify captcha" }
  }

  console.log("passed captcha")

  // upsert
  const [userObj] =
    await db`INSERT INTO users (email) VALUES (${email}) ON CONFLICT (email) DO UPDATE SET email = ${email} RETURNING *`

  const token = jwt.sign(
    {
      userId: userObj.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    },
    process.env.JWT_SECRET
  )

  await sendEmail({
    subject: `please confirm your email`,
    to: [email],
    from: process.env.EMAIL_FROM,
    text: `Hi,

For anti-spam measures please confirm your email before upvoting or submitting:

${process.env.NEXT_PUBLIC_SITE_URL}/api/confirm?token=${token}`,
  })

  console.log("sent email")

  return { message: "Check your mailbox" }
}
