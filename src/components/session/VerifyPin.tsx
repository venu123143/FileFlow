"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/useAuth"
import { Key, Lock } from "lucide-react"
import { toast } from "sonner"

interface VerifyPinModalProps {
  isOpen: boolean
  onVerified: () => void
  onClose?: () => void // Callback when modal is closed without verification
  title?: string
  description?: string
  required?: boolean // If true, modal cannot be closed until verified
}

export function VerifyPinModal({
  isOpen,
  onVerified,
  onClose,
  title = "Verify PIN",
  description = "Please enter your 4-digit PIN to continue",
  required = true,
}: VerifyPinModalProps) {
  const { verifyPin, verifyPinLoading, user } = useAuth()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin("")
      setError("")
      setIsVerified(false)
    }
  }, [isOpen])

  // Check if user has PIN set
  useEffect(() => {
    if (isOpen && user && !user.pin_hash) {
      toast.error("PIN not set. Please set your PIN in settings first.")
      // If PIN is not set and not required, allow closing
      if (!required) {
        onVerified()
      }
    }
  }, [isOpen, user, required, onVerified])

  const handleVerify = async () => {
    setError("")

    // Validation
    if (!pin || pin.length !== 4) {
      setError("PIN must be exactly 4 digits")
      return
    }

    if (!/^\d+$/.test(pin)) {
      setError("PIN must contain only numbers")
      return
    }

    const result = await verifyPin(pin)
    if (result.success) {
      setPin("")
      setError("")
      setIsVerified(true)
      toast.success("PIN verified successfully")
      onVerified()
    } else {
      setError(result.error || "Invalid PIN. Please try again.")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && pin.length === 4) {
      handleVerify()
    }
  }

  // Handle modal close
  const handleOpenChange = (open: boolean) => {
    if (!open && !isVerified) {
      // If modal is closing without verification, call onClose callback (e.g., navigate back)
      onClose?.()
    }
  }

  const hasPin = user?.pin_hash

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        showCloseButton={!required}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {hasPin ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin-input">Enter 4-Digit PIN</Label>
              <Input
                id="pin-input"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  if (value.length <= 4) {
                    setPin(value)
                    setError("")
                  }
                }}
                onKeyDown={handleKeyPress}
                className={error ? "border-red-500" : ""}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter your PIN to verify your identity
              </p>
            </div>

            <Button
              onClick={handleVerify}
              disabled={verifyPinLoading || pin.length !== 4}
              className="w-full"
            >
              {verifyPinLoading ? "Verifying..." : "Verify PIN"}
            </Button>

            {required && (
              <p className="text-xs text-center text-muted-foreground">
                PIN verification is required to continue
              </p>
            )}
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  PIN Not Set
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please set your PIN in settings before accessing this page.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default VerifyPinModal
