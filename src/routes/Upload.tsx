import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FileUploader, { type FileConfig } from '@/components/upload/FIleUploader';
import { useGlobalUpload } from '@/contexts/GlobalUploadContext';
import { useEffect } from 'react';

const Upload = () => {
    const { folder_id } = useParams<{ folder_id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { folder_name } = location.state || {};
    const { uploads, clearAllUploads } = useGlobalUpload();
    
    // Get uploads for this specific folder
    const folderUploads = Object.values(uploads).filter(upload => 
        upload.folderId === folder_id || (folder_id === "root" && !upload.folderId)
    );

    // Clear global uploads when entering upload page (they will be handled locally)
    useEffect(() => {
        clearAllUploads();
    }, [clearAllUploads]);

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Upload Files to {folder_name}</h1>
                            <p className="text-sm text-gray-600">Add files to your folder</p>
                        </div>
                    </div>
                </div>


                {/* Existing Uploads Section */}
                {folderUploads.length > 0 && (
                    <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Current Uploads ({folderUploads.length})
                        </h2>
                        <div className="space-y-3">
                            {folderUploads.map((upload) => (
                                <div key={upload.file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-sm font-medium text-gray-900">
                                            {upload.file.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {upload.status === 'uploading' ? `${upload.progress}%` : upload.status}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {upload.status === 'uploading' && (
                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${upload.progress}%` }}
                                                />
                                            </div>
                                        )}
                                        {upload.status === 'completed' && (
                                            <div className="text-green-600 text-sm">✓ Completed</div>
                                        )}
                                        {upload.status === 'error' && (
                                            <div className="text-red-600 text-sm">✗ Failed</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* File Uploader */}
                <FileUploader
                    allowedTypes={allowedTypes}
                    maxFiles={10}
                    folderId={folder_id}
                />

            </div>
        </div>
    );
};

export default Upload;