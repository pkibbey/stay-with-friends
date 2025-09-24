import { ReactNode } from "react"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function SearchLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }
  return <>{children}</>
}
