import { getModels } from "@/utils/db"
import SelectModels from "@/components/SelectModels"
import { Suspense } from "react"

export default async function CompareLayout({ children }) {
  const models = await getModels()

  return (
    <>
      <SelectModels models={models} />
      <br />
      <br />
      <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
    </>
  )
}
