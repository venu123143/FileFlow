import React from 'react'
import { motion } from 'framer-motion'
import { FileText, ImageIcon, Video, Music } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useFile } from '@/contexts/fileContext'

type RecentFilesProps = {
    page?: number
    limit?: number
    onItemClick?: (id: string) => void
}

function getIconMeta(fileType?: string | null) {
    const type = (fileType || '').toLowerCase()
    if (type.startsWith('image/')) return { Icon: ImageIcon, color: 'text-purple-500', bgColor: 'bg-purple-50', label: 'image' }
    if (type.startsWith('video/')) return { Icon: Video, color: 'text-blue-500', bgColor: 'bg-blue-50', label: 'video' }
    if (type.startsWith('audio/')) return { Icon: Music, color: 'text-orange-500', bgColor: 'bg-orange-50', label: 'audio' }
    return { Icon: FileText, color: 'text-slate-600', bgColor: 'bg-slate-100', label: type.split('/')[1] || 'file' }
}

const RecentFiles: React.FC<RecentFilesProps> = ({ page = 1, limit = 5, onItemClick }) => {
    const { getRecents, recents } = useFile()

    React.useEffect(() => {
        void getRecents(page, limit)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit])

    if (!recents || recents.files.length === 0) {
        return (
            <div className="text-sm text-slate-500 dark:text-slate-400">No recent files</div>
        )
    }

    return (
        <div className="space-y-3">
            {recents.files.map((file, index) => {
                const meta = getIconMeta(file.file_info?.file_type)
                return (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 + index * 0.05 }}
                        whileHover={{ x: 2 }}
                        className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                        onClick={() => onItemClick?.(file.id)}
                    >
                        <div className={cn('p-2.5 rounded-lg', meta.bgColor, 'group-hover:scale-110 transition-transform duration-200')}>
                            <meta.Icon className={cn('h-5 w-5', meta.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                {new Date(file.last_accessed_at || file.created_at).toLocaleString()}
                            </p>
                        </div>
                        <Badge variant="secondary" className="text-xs capitalize">
                            {meta.label}
                        </Badge>
                    </motion.div>
                )
            })}
        </div>
    )
}

export default RecentFiles


