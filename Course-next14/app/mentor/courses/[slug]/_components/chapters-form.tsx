'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { Chapter, Course } from '@/types';
import { ChaptersList } from './chapters-list';
import { updateCourseByMentor } from '@/actions/course-action';
import { createChapterByMentor } from '@/actions/chapter-action';
import { useRouter } from 'next/navigation';

interface ChaptersFormProps {
    initialData: Course;
    onRefresh?: Function;
}

const formSchema = z.object({
    title: z.string().min(1),
});

export const ChaptersForm = ({ initialData, onRefresh }: ChaptersFormProps) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const toggleCreating = () => {
        setIsCreating((current) => !current);
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (!values.title) return;
            await createChapterByMentor(initialData._id, values);

            toast.success('Chapter created');
            toggleCreating();
            typeof onRefresh === 'function' && onRefresh();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const onReorder = async (updateData: { _id: string; position: number }[]) => {
        try {
            setIsUpdating(true);
            toast.success('Chapters reordered');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const onEdit = (chapter: Chapter) => {
        router.push(`/mentor/courses/${initialData.slug}/chapters/${chapter._id}`);
    };

    return (
        <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
            {isUpdating && (
                <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
                    <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
                </div>
            )}
            <div className="font-medium flex items-center justify-between">
                Course chapters
                <Button onClick={toggleCreating} variant="ghost">
                    {isCreating ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add a chapter
                        </>
                    )}
                </Button>
            </div>
            <div className={cn('text-sm mt-2', !initialData.chapters?.length && 'text-slate-500 italic')}>
                {!initialData.chapters?.length && 'No chapters'}
                <ChaptersList onEdit={onEdit} onReorder={onReorder} items={initialData.chapters || []} />
            </div>
            {isCreating && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input disabled={isSubmitting} placeholder="e.g. 'Introduction to the course'" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={!isValid || isSubmitting} type="submit">
                            Create
                        </Button>
                    </form>
                </Form>
            )}
            {!isCreating && <p className="text-xs text-muted-foreground mt-4">Drag and drop to reorder the chapters</p>}
        </div>
    );
};
