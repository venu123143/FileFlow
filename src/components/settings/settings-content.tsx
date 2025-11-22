"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/useAuth"
import { useTheme } from "@/contexts/ThemeContext"
import {
  User,
  Shield,
  Bell,
  Smartphone,
  HardDrive,
  Globe,
  Lock,
  Eye,
  Download,
  Upload,
  Settings,
  Palette,
  Key,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
  Mail,
  UserCircle,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface SettingsContentProps {
  activeTab: string
}

export function SettingsContent({ activeTab }: SettingsContentProps) {
  const { user, setPin, changePin, setPinLoading, changePinLoading, saveUser } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [pin, setPinValue] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [oldPin, setOldPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmNewPin, setConfirmNewPin] = useState("")
  const [error, setError] = useState("")
  const [isChangingPin, setIsChangingPin] = useState(false)

  const handleSetPin = async () => {
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

    if (pin !== confirmPin) {
      setError("PINs do not match")
      return
    }

    const result = await setPin(pin)
    if (result.success) {
      setPinValue("")
      setConfirmPin("")
      setError("")
      // Update user in context and localStorage to reflect pin_hash
      if (user) {
        const updatedUser = { ...user, pin_hash: "set" }
        saveUser(updatedUser)
      }
    } else {
      setError(result.error || "Failed to set PIN")
    }
  }

  const handleChangePin = async () => {
    setError("")

    // Validation
    if (!oldPin || oldPin.length !== 4) {
      setError("Old PIN must be exactly 4 digits")
      return
    }

    if (!newPin || newPin.length !== 4) {
      setError("New PIN must be exactly 4 digits")
      return
    }

    if (!/^\d+$/.test(oldPin) || !/^\d+$/.test(newPin)) {
      setError("PINs must contain only numbers")
      return
    }

    if (newPin !== confirmNewPin) {
      setError("New PINs do not match")
      return
    }

    if (oldPin === newPin) {
      setError("New PIN must be different from old PIN")
      return
    }

    const result = await changePin(oldPin, newPin)
    if (result.success) {
      setOldPin("")
      setNewPin("")
      setConfirmNewPin("")
      setError("")
      setIsChangingPin(false)
    } else {
      setError(result.error || "Failed to change PIN")
    }
  }
  const renderGeneralTab = () => (
    <motion.div
      key="general"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Your account information and details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.display_name && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={user.display_name || "Not set"}
                  readOnly
                  className="bg-muted"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Role
              </Label>
              <Input
                id="role"
                value={user?.role || ""}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                User ID
              </Label>
              <Input
                id="userId"
                value={user?.id || ""}
                readOnly
                className="bg-muted font-mono text-xs cursor-not-allowed"
              />
            </div>
            {user?.last_login && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Last Login
                </Label>
                <Input
                  id="lastLogin"
                  value={new Date(user.last_login).toLocaleString()}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {user?.email_verified ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className="text-sm font-medium">Email Verified</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email_verified ? "Verified" : "Not verified"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {user?.is_active ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage
          </CardTitle>
          <CardDescription>
            Your current storage usage and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Storage Used</span>
            <span className="text-sm font-medium">45.2 GB / 100 GB</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '45.2%' }}></div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Free Plan</Badge>
            <span className="hidden sm:inline">•</span>
            <span>100 GB total storage</span>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-1.5 p-1.5 bg-muted rounded-lg">
              <Button
                onClick={() => setTheme('light')}
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 p-2"
              >
                <Sun className="h-4 w-4" />
                <span className="hidden sm:inline">Light</span>
              </Button>
              <Button
                onClick={() => setTheme('dark')}
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 p-2"
              >
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">Dark</span>
              </Button>
              <Button
                onClick={() => setTheme('system')}
                variant={theme === 'system' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 p-2"
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">System</span>
              </Button>
            </div>
            {theme === 'system' && (
              <p className="text-xs text-muted-foreground">
                Currently using {resolvedTheme === 'dark' ? 'dark' : 'light'} mode based on your system preference
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderSecurityTab = () => (
    <motion.div
      key="security"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password & Security
          </CardTitle>
          <CardDescription>
            Update your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <Label>Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">Use an authenticator app for additional security</p>
            </div>
            <Switch />
          </div>
          <Button variant="outline">Setup 2FA</Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <Label>Public Profile</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
            </div>
            <Switch />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <Label>Analytics</Label>
              <p className="text-sm text-muted-foreground">Help improve the app with usage data</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderNotificationsTab = () => (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified about security events</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <Label>Storage Updates</Label>
              <p className="text-sm text-muted-foreground">Receive storage usage notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <Label>Product Updates</Label>
              <p className="text-sm text-muted-foreground">Stay informed about new features</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Manage notifications on your devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <Label>File Sharing</Label>
              <p className="text-sm text-muted-foreground">When someone shares files with you</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <Label>Storage Warnings</Label>
              <p className="text-sm text-muted-foreground">When approaching storage limits</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderPinTab = () => {
    const hasPin = user?.pin_hash

    return (
      <motion.div
        key="pin"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              PIN Settings
            </CardTitle>
            <CardDescription>
              Set a 4-digit PIN for quick access and additional security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPin ? (
              <div className="space-y-4">
                {!isChangingPin ? (
                  <>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-green-900 dark:text-green-100">PIN Already Set</p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          You have already set a PIN for your account. Your session will be created when you verify your PIN.
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => setIsChangingPin(true)}
                        variant="outline"
                        className="w-full"
                      >
                        Change PIN
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPin">Enter Current PIN</Label>
                      <Input
                        id="oldPin"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="0000"
                        value={oldPin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value.length <= 4) {
                            setOldPin(value)
                            setError("")
                          }
                        }}
                        className={error ? "border-red-500" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPin">Enter New 4-Digit PIN</Label>
                      <Input
                        id="newPin"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="0000"
                        value={newPin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value.length <= 4) {
                            setNewPin(value)
                            setError("")
                          }
                        }}
                        className={error ? "border-red-500" : ""}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a 4-digit numeric PIN
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPin">Confirm New PIN</Label>
                      <Input
                        id="confirmNewPin"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="0000"
                        value={confirmNewPin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value.length <= 4) {
                            setConfirmNewPin(value)
                            setError("")
                          }
                        }}
                        className={error ? "border-red-500" : ""}
                      />
                    </div>
                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={handleChangePin}
                        disabled={changePinLoading || oldPin.length !== 4 || newPin.length !== 4 || confirmNewPin.length !== 4}
                        className="flex-1 w-full sm:w-auto"
                      >
                        {changePinLoading ? "Changing PIN..." : "Change PIN"}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsChangingPin(false)
                          setOldPin("")
                          setNewPin("")
                          setConfirmNewPin("")
                          setError("")
                        }}
                        variant="outline"
                        disabled={changePinLoading}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Your new PIN will be securely hashed and stored. Make sure to remember it!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin">Enter 4-Digit PIN</Label>
                  <Input
                    id="pin"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="0000"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      if (value.length <= 4) {
                        setPinValue(value)
                        setError("")
                      }
                    }}
                    className={error ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a 4-digit numeric PIN
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPin">Confirm PIN</Label>
                  <Input
                    id="confirmPin"
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="0000"
                    value={confirmPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "")
                      if (value.length <= 4) {
                        setConfirmPin(value)
                        setError("")
                      }
                    }}
                    className={error ? "border-red-500" : ""}
                  />
                </div>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                <Button
                  onClick={handleSetPin}
                  disabled={setPinLoading || pin.length !== 4 || confirmPin.length !== 4}
                  className="w-full"
                >
                  {setPinLoading ? "Setting PIN..." : "Set PIN"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Your PIN will be securely hashed and stored. Make sure to remember it!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderAppsTab = () => (
    <motion.div
      key="apps"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Connected Apps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Connected Applications
          </CardTitle>
          <CardDescription>
            Manage third-party applications connected to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">Google Drive</p>
                  <p className="text-sm text-muted-foreground">Connected for file sync</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">Disconnect</Button>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">Dropbox</p>
                  <p className="text-sm text-muted-foreground">Connected for backup</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">Disconnect</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Access
          </CardTitle>
          <CardDescription>
            Manage API keys and integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input id="apiKey" value="sk_...abc123" readOnly className="flex-1" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">Copy</Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">Regenerate</Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Use this API key to integrate FileFlow with your applications
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralTab()
      case "security":
        return renderSecurityTab()
      case "pin":
        return renderPinTab()
      case "notifications":
        return renderNotificationsTab()
      case "apps":
        return renderAppsTab()
      default:
        return renderGeneralTab()
    }
  }

  return (
    <div className="min-h-[600px]">
      {renderContent()}
    </div>
  )
}
