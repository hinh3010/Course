'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem } from '@/components/ui/form';
import { Chapter } from '@/types';
import { updateChapterByMentor } from '@/actions/chapter-action';

interface ChapterAccessFormProps {
    initialData: Chapter;
    onRefresh?: Function;
}

const formSchema = z.object({
    isFree: z.boolean().default(false),
});

export const ChapterAccessForm = ({ initialData, onRefresh }: ChapterAccessFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isFree: !!initialData.isFree,
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (values.isFree === initialData.isFree) return;
            const courseId = typeof initialData.course === 'string' ? initialData.course : initialData.course._id;

            await updateChapterByMentor({ courseId: courseId, chapterId: initialData._id }, values);

            toast.success('Chapter updated successfully');
            typeof onRefresh === 'function' && onRefresh();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">Chapter access</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
                    <FormField
                        control={form.control}
                        name="isFree"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} type="submit" />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormDescription>
                                        {initialData.isFree ? <>This chapter is free for preview.</> : <>This chapter is not free.</>}
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    );
};
