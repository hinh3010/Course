'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Editor } from '@/components/editor';
import { Preview } from '@/components/preview';
import { Chapter } from '@/types';
import { useForm } from 'react-hook-form';
import { updateChapterByMentor } from '@/actions/chapter-action';

interface ChapterDescriptionFormProps {
    initialData: Chapter;
    onRefresh?: Function;
}

const formSchema = z.object({
    description: z.string().min(1),
});

export const ChapterDescriptionForm = ({ initialData, onRefresh }: ChapterDescriptionFormProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: initialData?.description || '',
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (values.description === initialData.description) return;
            const courseId = typeof initialData.course === 'string' ? initialData.course : initialData.course._id;

            await updateChapterByMentor({ courseId: courseId, chapterId: initialData._id }, values);

            toast.success('Chapter updated successfully');
            typeof onRefresh === 'function' && onRefresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            toggleEdit();
        }
    };

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Chapter description
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit description
                        </>
                    )}
                </Button>
            </div>
            {isEditing ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Editor {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-x-2">
                            <Button disabled={!isValid || isSubmitting} type="submit">
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            ) : (
                <div className={cn('text-sm mt-2', !initialData.description && 'text-slate-500 italic')}>
                    {!initialData.description && 'No description'}
                    {initialData.description && <Preview value={initialData.description} />}
                </div>
            )}
        </div>
    );
};
