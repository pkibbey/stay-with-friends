import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, MailPlus } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-lg ring-1 ring-black/5 dark:bg-gray-950 dark:ring-white/10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Ready to stay with friends?
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Create your account to connect with your circle and plan your next visit.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/auth/signin">
              <Button size="lg" className="px-7">
                <Users className="mr-2 h-5 w-5" /> Sign in or create account
              </Button>
            </Link>
            <Link href="/invite">
              <Button size="lg" variant="outline" className="px-7">
                <MailPlus className="mr-2 h-5 w-5" /> Invite a friend
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
