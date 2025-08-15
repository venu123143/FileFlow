import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

interface InteractiveButtonProps extends ComponentProps<typeof Button> {
  children: React.ReactNode
  loading?: boolean
  success?: boolean
}

export function InteractiveButton({
  children,
  className,
  loading = false,
  success = false,
  disabled,
  ...props
}: InteractiveButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          success && "bg-green-600 hover:bg-green-700",
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        <motion.div className="flex items-center gap-2" animate={{ opacity: loading ? 0.7 : 1 }}>
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          )}
          {success ? "Success!" : children}
        </motion.div>
      </Button>
    </motion.div>
  )
}
