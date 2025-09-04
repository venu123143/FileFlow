import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import FileUploader, { type FileConfig } from '@/components/upload/FIleUploader';

const Upload = () => {
    const { folder_id } = useParams<{ folder_id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { folder_name } = location.state || {};

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