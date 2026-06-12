"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, type FormEvent } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { authService } from "@/lib/services/auth.service"
import { useAuthStore } from "@/lib/stores/auth.store"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onSubmit",
  })

  const {
    register,
    getValues,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = form

  // eslint-disable-next-line react-hooks/incompatible-library
  const rememberMe = watch("rememberMe")

  useEffect(() => {
    const cookies = document.cookie.split(";")
    const rememberCookie = cookies.find((c) => c.startsWith("remember_email="))
    if (rememberCookie) {
      const emailValue = decodeURIComponent(rememberCookie.split("=")[1])
      setValue("email", emailValue)
      setValue("rememberMe", true)
    }
  }, [setValue])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)
    clearErrors()

    const result = loginSchema.safeParse(getValues())
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof LoginFormValues
        setError(path, {
          type: "manual",
          message: issue.message,
        })
      })
      return
    }

    setIsSubmitting(true)

    try {
      const user = await authService.login({
        email: result.data.email,
        password: result.data.password,
      })

      setUser(user)

      if (result.data.rememberMe) {
        document.cookie = `remember_email=${encodeURIComponent(
          result.data.email
        )}; path=/; max-age=${60 * 60 * 24 * 30}`
      } else {
        document.cookie = "remember_email=; path=/; max-age=0"
      }

      // Handle redirect
      const searchParams = new URLSearchParams(window.location.search)
      const from = searchParams.get("from") || "/dashboard"
      router.replace(from)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials and try again."

      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6.5">
      <div className="space-y-6.5">
        {/* Email Input */}
        <div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail className="size-5 text-muted-foreground" />
            </div>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="E-mail"
              required
              aria-invalid={errors.email ? "true" : "false"}
              {...register("email", {
                onChange: () => {
                  if (errors.email) clearErrors("email")
                },
              })}
              className="h-12 w-full rounded-md border-input bg-white pl-12 shadow-sm focus-visible:ring-primary/20"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-destructive">
              <AlertCircle className="size-3" /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Lock className="size-5 text-muted-foreground" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              required
              aria-invalid={errors.password ? "true" : "false"}
              {...register("password", {
                onChange: () => {
                  if (errors.password) clearErrors("password")
                },
              })}
              className="h-12 w-full rounded-md border-input bg-white pr-12 pl-12 shadow-sm focus-visible:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-muted-foreground transition-colors hover:text-muted-foreground/80"
            >
              {showPassword ? (
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-destructive">
              <AlertCircle className="size-3" /> {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) =>
            setValue("rememberMe", checked as boolean)
          }
          className="cursor-pointer rounded border-neutral-300 bg-white data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <Label
          htmlFor="remember"
          className="cursor-pointer text-sm leading-none font-medium text-neutral-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-80"
        >
          Remember me
        </Label>
      </div>

      {serverError && (
        <div className="animate-in rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive fade-in">
          <p className="flex items-center gap-2">
            <AlertCircle className="size-4" /> {serverError}
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-md bg-neutral-400 font-semibold text-white transition-colors hover:bg-neutral-400/80"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  )
}
