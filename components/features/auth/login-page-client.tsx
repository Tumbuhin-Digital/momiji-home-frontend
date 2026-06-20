"use client"

import Image from "next/image"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

import { LoginForm } from "./login-form"

export default function LoginPageClient() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-linear-to-t from-[#629EB3] to-[#8CAEBA] px-4 py-12">
      <div className="w-full max-w-lg space-y-5 sm:space-y-7">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/logo-white.png"
            alt="MOMIJI Logo"
            width={363}
            height={69}
            className="h-auto w-61.25 object-contain sm:w-90.75"
            priority
          />
        </div>

        {/* Login Card */}
        <div className="space-y-5 rounded-xl bg-secondary p-8 sm:space-y-8">
          <div>
            <p className="text-sm font-medium text-neutral-800">login to</p>
            <h1 className="text-lg font-semibold text-neutral-800">
              Admin Dashboard
            </h1>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center p-8">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
