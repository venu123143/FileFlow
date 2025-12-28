import { useState, useEffect } from "react"
import { useApiToken } from "@/contexts/ApiTokenContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Trash2, Copy, Check, AlertTriangle, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ApiTokenSettings() {
    const { tokens, loading, fetchTokens, generateToken, revokeToken } = useApiToken()
    const [isGenerateOpen, setIsGenerateOpen] = useState(false)
    const [newTokenName, setNewTokenName] = useState("")
    const [expiresAt, setExpiresAt] = useState<Date>()
    const [generatedToken, setGeneratedToken] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const [tokenToDelete, setTokenToDelete] = useState<string | null>(null)

    useEffect(() => {
        fetchTokens()
    }, [fetchTokens])

    const handleGenerate = async () => {
        if (!newTokenName.trim()) {
            toast.error("Please enter a token name")
            return
        }

        const result = await generateToken({
            name: newTokenName.trim(),
            expires_at: expiresAt ? expiresAt.toISOString() : undefined
        })

        if (result.success && result.token?.token) {
            setGeneratedToken(result.token.token)
            setNewTokenName("")
            setExpiresAt(undefined)
            // Don't close dialog yet, show the token
        }
    }

    const handleCopy = () => {
        if (generatedToken) {
            navigator.clipboard.writeText(generatedToken)
            setCopied(true)
            toast.success("Token copied to clipboard")
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleCloseDialog = () => {
        setIsGenerateOpen(false)
        setGeneratedToken(null)
        setNewTokenName("")
        setExpiresAt(undefined)
    }

    const handleDeleteClick = (id: string) => {
        setTokenToDelete(id)
    }

    const confirmDelete = async () => {
        if (tokenToDelete) {
            await revokeToken(tokenToDelete)
            setTokenToDelete(null)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            API Access
                        </CardTitle>
                        <CardDescription>
                            Manage API tokens for external access (Max 3 tokens)
                        </CardDescription>
                    </div>
                    <Button
                        onClick={() => setIsGenerateOpen(true)}
                        disabled={tokens.length >= 3 || loading}
                        size="sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Token
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {tokens.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        No API tokens generated yet.
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Last Used</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Usage Count</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokens.map((token) => (
                                    <TableRow key={token.id}>
                                        <TableCell className="font-medium">{token.name}</TableCell>
                                        <TableCell>{new Date(token.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {token.expires_at
                                                ? new Date(token.expires_at).toLocaleDateString()
                                                : 'Never'}
                                        </TableCell>
                                        <TableCell>
                                            {token.last_used_at
                                                ? new Date(token.last_used_at).toLocaleString()
                                                : 'Never'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={token.is_active ? "default" : "secondary"}>
                                                {token.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{token.usage_count}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(token.id)}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <Dialog open={isGenerateOpen} onOpenChange={handleCloseDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate API Token</DialogTitle>
                            <DialogDescription>
                                Create a new API token to access your files programmatically.
                            </DialogDescription>
                        </DialogHeader>

                        {!generatedToken ? (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tokenName">
                                        Token Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="tokenName"
                                        placeholder="e.g., Development Server"
                                        value={newTokenName}
                                        onChange={(e) => setNewTokenName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !expiresAt && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {expiresAt ? format(expiresAt, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={expiresAt}
                                                onSelect={setExpiresAt}
                                                initialFocus
                                                disabled={(date) => date < new Date()}
                                                captionLayout="dropdown-buttons"
                                                fromYear={new Date().getFullYear()}
                                                toYear={new Date().getFullYear() + 10}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="font-medium">Make sure to copy your token now.</p>
                                        <p>You won't be able to see it again!</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Your API Token</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={generatedToken}
                                            readOnly
                                            className="font-mono text-xs"
                                        />
                                        <Button size="icon" variant="outline" onClick={handleCopy}>
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            {!generatedToken ? (
                                <>
                                    <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                                    <Button onClick={handleGenerate} disabled={loading}>Generate</Button>
                                </>
                            ) : (
                                <Button onClick={handleCloseDialog}>Done</Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!tokenToDelete} onOpenChange={(open) => !open && setTokenToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the API token
                                and any applications using it will lose access immediately.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                Delete Token
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}
