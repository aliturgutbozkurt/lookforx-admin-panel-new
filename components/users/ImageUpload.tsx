'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import api from '@/lib/api';

interface ImageUploadProps {
    currentImageUrl?: string;
    onImageUploaded: (imageUrl: string, thumbnailUrl: string) => void;
    onImageRemoved?: () => void;
}

export default function ImageUpload({ currentImageUrl, onImageUploaded, onImageRemoved }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

    const validateFile = (file: File): string | null => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (!validTypes.includes(file.type)) {
            return 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF.';
        }

        if (file.size > maxSize) {
            return 'File too large. Maximum size is 100MB.';
        }

        return null;
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post<{ key: string; thumbnailKey: string }>('/api/v1/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageKey = response.data.key;
            const thumbnailKey = response.data.thumbnailKey;

            // Use backend proxy for public URL since we don't have a public R2 domain
            const publicUrl = `http://localhost:8080/api/v1/media/download?key=${imageKey}`;
            const thumbnailUrl = `http://localhost:8080/api/v1/media/download?key=${thumbnailKey}`;

            setPreview(publicUrl);
            onImageUploaded(publicUrl, thumbnailUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = useCallback((file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload
        uploadFile(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (onImageRemoved) {
            onImageRemoved();
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleRemove}
                            disabled={uploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                            Drag and drop an image here, or click to select
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            JPEG, PNG, WebP, GIF (max 5MB)
                        </p>
                    </div>
                )}

                <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />

                {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                            <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
