import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FileUploader, { type FileConfig } from '@/components/upload/FIleUploader';

const Upload = () => {
    const { folder_id } = useParams<{ folder_id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { folder_name, access_level } = location.state || {};

    const allowedTypes: FileConfig[] = [
        {
            type: 'image',
            maxSize: 50,
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        },
        {
            type: 'video',
            maxSize: 2000, // 2GB
            allowedExtensions: ['.mp4', '.avi', '.mov', '.mkv', '.wmv']
        },
        {
            type: 'pdf',
            maxSize: 100,
            allowedExtensions: ['.pdf']
        },
        {
            type: 'text',
            maxSize: 10,
            allowedExtensions: ['.txt', '.doc', '.docx']
        }
    ];

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--color-upload-bg-gradient-from), var(--color-upload-bg-gradient-to))' }}>
            <div className="container mx-auto px-4 py-6 sm:py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-accent hover:shadow-sm rounded-lg transition-all duration-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Upload Files to {folder_name || 'Folder'}</h1>
                            <p className="text-sm text-muted-foreground">Add files to your folder</p>
                        </div>
                    </div>
                </div>


                {/* File Uploader */}
                <FileUploader
                    allowedTypes={allowedTypes}
                    maxFiles={10}
                    folderId={folder_id}
                    accessLevel={access_level}
                />

            </div>
        </div>
    );
};

export default Upload;