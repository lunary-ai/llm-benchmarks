"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SelectModels({ models }) {
  const router = useRouter()
  const [model1, setModel1] = useState("")
  const [model2, setModel2] = useState("")

  useEffect(() => {
    if (model1 && model2) {
      router.push(`/compare/${model1}-vs-${model2}`)
    }
  }, [model1, model2])

  return (
    <div>
      <select onChange={(e) => setModel1(e.target.value)}>
        <option value="">Select model 1</option>
        {models

          .sort((a, b) => b.total_score - a.total_score)
          .map((model, i) => (
            <option key={i} value={model.slug}>
              {model.name}
            </option>
          ))}
      </select>
      <select onChange={(e) => setModel2(e.target.value)}>
        <option value="">Select model 2</option>
        {models

          .sort((a, b) => b.total_score - a.total_score)
          .map((model, i) => (
            <option key={i} value={model.slug}>
              {model.name}
            </option>
          ))}
      </select>
    </div>
  )
}
