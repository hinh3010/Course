'use client';
import Link from 'next/link';
import { ArrowLeft, Eye, LayoutDashboard, Video } from 'lucide-react';

import { IconBadge } from '@/components/icon-badge';
import { Banner } from '@/components/banner';

import { ChapterTitleForm } from './_components/chapter-title-form';
import { ChapterDescriptionForm } from './_components/chapter-description-form';
import { ChapterAccessForm } from './_components/chapter-access-form';
const ChapterVideoForm = dynamic(() => import('./_components/chapter-video-form'), {
    ssr: false,
});

import { ChapterActions } from './_components/chapter-actions';
import faker, { Chapter } from '@/types';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getChapterByMentor } from '@/actions/chapter-action';
import toast from 'react-hot-toast';
import { LoadingProvider } from '@/components/providers/loading-provider';

const ChapterSlugPage = ({ params }: { params: { slug: string; chapterId: string } }) => {
    const [chapter, setChapter] = useState<Chapter>(faker.chapters[0]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchChapter = useCallback(async () => {
        try {
            const fetchedChapter = await getChapterByMentor(params.slug, params.chapterId);
            console.log({ fetchedChapter });
            setChapter(fetchedChapter);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [params.slug, params.chapterId]);

    useEffect(() => {
        fetchChapter();
    }, [fetchChapter]);

    const { completionText, isComplete } = useMemo(() => {
        const requiredFields = [chapter.title, chapter.description, chapter.videoUrl];

        const totalFields = requiredFields.length;
        const completedFields = requiredFields.filter(Boolean).length;
        const completionText = `(${completedFields}/${totalFields})`;
        const isComplete = requiredFields.every(Boolean);

        return {
            totalFields,
            completedFields,
            completionText,
            isComplete,
        };
    }, [chapter.description, chapter.title, chapter.videoUrl]);

    return (
        <LoadingProvider isLoading={isLoading}>
            <>
                {!chapter.isPublished && <Banner variant="warning" label="This chapter is unpublished. It will not be visible in the course" />}
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="w-full">
                            <Link href={`/mentor/courses/${params.slug}`} className="flex items-center text-sm hover:opacity-75 transition mb-6">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to course setup
                            </Link>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col gap-y-2">
                                    <h1 className="text-2xl font-medium">Chapter Creation</h1>
                                    <span className="text-sm text-slate-700">Complete all fields {completionText}</span>
                                </div>
                                <ChapterActions
                                    disabled={!isComplete}
                                    courseId={params.slug}
                                    chapterId={params.chapterId}
                                    isPublished={chapter.isPublished}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-16">
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={LayoutDashboard} />
                                    <h2 className="text-xl">Customize your chapter</h2>
                                </div>
                                <ChapterTitleForm initialData={chapter} onRefresh={fetchChapter} />
                                <ChapterDescriptionForm initialData={chapter} onRefresh={fetchChapter} />
                            </div>
                            <div>
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={Eye} />
                                    <h2 className="text-xl">Access Settings</h2>
                                </div>
                                <ChapterAccessForm initialData={chapter} onRefresh={fetchChapter} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={Video} />
                                <h2 className="text-xl">Add a video</h2>
                            </div>
                            <ChapterVideoForm initialData={chapter} />
                        </div>
                    </div>
                </div>
            </>
        </LoadingProvider>
    );
};

export default ChapterSlugPage;
