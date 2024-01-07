'use client';

import { ImageIcon, Pencil, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { updateCourseByMentor } from '@/actions/course-action';
import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';

interface ImageFormProps {
    initialData: Course;
}

export const ImageForm = ({ initialData }: ImageFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [thumbnail, setThumbnail] = useState(initialData.thumbnail);

    const toggleEdit = () => setIsEditing((current) => !current);

    const onSubmit = async () => {
        try {
            if (thumbnail === initialData.thumbnail) return;

            // await updateCourseByMentor(initialData._id, { thumbnail });
            toast.success('Course updated successfully');
            toggleEdit();
        } catch {
            toast.error('Something went wrong');
        }
    };

    const handleFileChange = (file: File | FileList) => {
        if (!(file instanceof File)) return;

        const imageUrl = URL.createObjectURL(file);
        setThumbnail(imageUrl);
        setIsEditing(false);
    };

    useEffect(() => {
        return () => {
            if (thumbnail) {
                URL.revokeObjectURL(thumbnail);
            }
        };
    }, [thumbnail]);

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course image
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && !thumbnail && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add an image
                        </>
                    )}
                    {!isEditing && thumbnail && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit image
                        </>
                    )}
                </Button>
            </div>
            {!isEditing &&
                (!thumbnail ? (
                    <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                        <ImageIcon className="h-10 w-10 text-slate-500" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <Image alt="Upload" fill className="object-cover rounded-md" src={thumbnail} />
                    </div>
                ))}
            {isEditing && (
                <div>
                    <FileUpload onChange={handleFileChange} />
                    <div className="text-xs text-muted-foreground mt-4">16:9 aspect ratio recommended</div>
                    <Button className="mt-4" onClick={onSubmit} type="submit">
                        Save
                    </Button>
                </div>
            )}
        </div>
    );
};
