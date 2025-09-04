"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Home, Lock, Mail, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Unauthorized() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut" as const,
      },
    },
  }

  return (
    <div className="h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Large 403 Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="text-[20rem] md:text-[25rem] lg:text-[30rem] font-black text-transparent text-opacity-30 bg-gradient-to-r from-cineflex-red/20 via-destructive/30 to-cineflex-red/20 bg-clip-text leading-none select-none"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          403
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-cineflex-red/10 rounded-full blur-xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-cineflex-pink/10 rounded-full blur-xl"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-10 w-24 h-24 bg-primary/5 rounded-full blur-lg"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        />
      </div>

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Error Message */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {"You don't have permission to access this resource. This area is restricted to authorized users only."}
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Lock className="w-6 h-6 text-cineflex-red mx-auto mb-2" />
              </motion.div>
              <h3 className="font-semibold text-foreground mb-1 text-sm">Secure Access</h3>
              <p className="text-xs text-muted-foreground">Requires proper authentication</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Shield className="w-6 h-6 text-cineflex-red mx-auto mb-2" />
              </motion.div>
              <h3 className="font-semibold text-foreground mb-1 text-sm">Protected Resource</h3>
              <p className="text-xs text-muted-foreground">Insufficient permissions</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Mail className="w-6 h-6 text-cineflex-red mx-auto mb-2" />
              </motion.div>
              <h3 className="font-semibold text-foreground mb-1 text-sm">Need Access?</h3>
              <p className="text-xs text-muted-foreground">Contact administrator</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="bg-cineflex-red hover:bg-cineflex-red/90 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="submit"
              size="lg"
              // className="border-2 border-cineflex-red/20 hover:border-cineflex-red/40 hover:bg-cineflex-red/5 px-6 py-2 rounded-xl font-semibold transition-all duration-300 bg-transparent"
              onClick={() => (window.location.href = "/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Home Page
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="lg"
              className="hover:bg-muted/50 px-6 py-2 rounded-xl font-semibold transition-all duration-300"
              onClick={() => (window.location.href = "mailto:support@example.com")}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
