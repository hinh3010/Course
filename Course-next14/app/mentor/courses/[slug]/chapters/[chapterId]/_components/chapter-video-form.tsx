'use client';
import { Pencil, PlusCircle, Video } from 'lucide-react';
import { forwardRef, useEffect, useState } from 'react';

import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/ui/button';
import { Chapter } from '@/types';

import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('@/components/video-player').then((a) => a.VideoPlayer), {
    ssr: false,
});

interface ChapterVideoFormProps {
    initialData: Chapter;
}

const _ChapterVideoForm = ({ initialData }: ChapterVideoFormProps, ref: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [videoUrl, setVideoUrl] = useState(initialData.videoUrl);

    const toggleEdit = () => setIsEditing((current) => !current);

    const handleFileChange = (file: File | FileList) => {
        if (!(file instanceof File)) return;

        const fileUrl = URL.createObjectURL(file);
        setVideoUrl(fileUrl);
        setIsEditing(false);
    };

    useEffect(() => {
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Chapter video
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? (
                        'Cancel'
                    ) : (
                        <>
                            {videoUrl ? <Pencil className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                            {videoUrl ? 'Edit video' : 'Add a video'}
                        </>
                    )}
                </Button>
            </div>

            {isEditing ? (
                <div>
                    <FileUpload accepts={['mp4']} onChange={handleFileChange} />
                    <div className="text-xs text-muted-foreground mt-4">Upload this chapter&apos;s video</div>
                </div>
            ) : (
                <div>
                    {videoUrl ? (
                        <div className="relative aspect-video mt-2">
                            <VideoPlayer videoUrl={videoUrl} thumbnail={initialData.thumbnail} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                            <Video className="h-10 w-10 text-slate-500" />
                        </div>
                    )}
                    {!isEditing && (
                        <div className="text-xs text-muted-foreground mt-2">
                            Videos can take a few minutes to process. Refresh the page if the video does not appear.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default forwardRef(_ChapterVideoForm);
