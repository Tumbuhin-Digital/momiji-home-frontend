"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

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
        className="bg-secondary sm:max-w-sm"
        showCloseButton={false}
      >
        {/* Icon + Header */}
        <DialogPanel className="flex flex-col items-center gap-6 p-4!">
          <div className="relative flex size-16 items-center justify-center rounded-full bg-destructive/10 p-3">
            <div className="absolute inset-0 animate-ping rounded-full bg-destructive/20 opacity-20 duration-3000" />
            <LogOut className="relative z-10 size-8 text-destructive" />
          </div>
          <div className="w-full">
            <DialogHeader className="p-0 text-center">
              <DialogTitle className="tracking-wide text-destructive sm:text-[22px]">
                Confirm Logout
              </DialogTitle>
              <DialogDescription className="text-[15px] leading-relaxed">
                Are you sure you want to log out of MOMIJI Operations?
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogPanel>

        <DialogFooter
          variant="bare"
          className="w-full flex-col-reverse gap-3 px-6 pb-6 sm:flex-col-reverse sm:space-x-0 sm:px-6"
        >
          <DialogClose
            render={
              <Button
                variant="outline"
                size="lg"
                className="w-full font-medium text-slate-500"
                onClick={onClose}
                disabled={isLoading}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="button"
            size="lg"
            variant="destructive"
            className="w-full font-medium"
            onClick={confirmLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Logging out...
              </>
            ) : (
              "Log Out"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
