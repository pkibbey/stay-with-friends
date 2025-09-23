"use client"

import { Button } from '@/components/ui/button'

export function SignInButton() {
  return (
    <Button onClick={() => window.location.href = '/auth/signin'}>
      Sign In
    </Button>
  )
}