"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { authService } from "@/lib/services/auth.service"
import { useAuthStore } from "@/lib/stores/auth.store"

interface LogoutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
}: LogoutConfirmModalProps) {
  const router = useRouter()
  const clearUser = useAuthStore((state) => state.clearUser)
  const [isLoading, setIsLoading] = useState(false)

  const confirmLogout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      clearUser()
      router.push("/auth/login")
    } catch (err) {
      console.error("Logout failed:", err)
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-secondary sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl text-destructive sm:text-2xl">
            Confirm Logout
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-alternate sm:text-base">
            Are you sure you want to log out of MOMIJI Operations?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-3 pt-2 sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 font-medium sm:text-lg"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            size="lg"
            variant="destructive"
            className="flex-1 font-medium sm:text-lg"
            onClick={confirmLogout}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Log Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
