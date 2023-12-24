'use client';

import { ImageIcon, Pencil, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { updateCourse } from '@/actions/course-action';
import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';

interface ImageFormProps {
    initialData: Course;
}

const formSchema = z.object({
    thumbnail: z.string().min(1, {
        message: 'Image is required',
    }),
});

export const ImageForm = ({ initialData }: ImageFormProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (values.thumbnail === initialData.thumbnail) return;

            await updateCourse(initialData._id, values);
            toast.success('Course updated successfully');
            toggleEdit();
        } catch {
            toast.error('Something went wrong');
        }
    };
    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course image
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && !initialData.thumbnail && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add an image
                        </>
                    )}
                    {!isEditing && initialData.thumbnail && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit image
                        </>
                    )}
                </Button>
            </div>
            {!isEditing &&
                (!initialData.thumbnail ? (
                    <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
                        <ImageIcon className="h-10 w-10 text-slate-500" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <Image alt="Upload" fill className="object-cover rounded-md" src={initialData.thumbnail} />
                    </div>
                ))}
            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="courseImage"
                        onChange={(url: string) => {
                            if (url) {
                                onSubmit({ thumbnail: url });
                            }
                        }}
                    />
                    <div className="text-xs text-muted-foreground mt-4">16:9 aspect ratio recommended</div>
                </div>
            )}
        </div>
    );
};
