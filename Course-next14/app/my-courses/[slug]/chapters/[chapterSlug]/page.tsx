'use client';
import { File } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Banner } from '@/components/banner';
import { Preview } from '@/components/preview';
import { Separator } from '@/components/ui/separator';

const VideoPlayer = dynamic(() => import('./_components/video-player').then((a) => a.VideoPlayer), {
    ssr: false,
});

import { getMyCourseBySlug } from '@/actions/course-action';
import { LoadingProvider } from '@/components/providers/loading-provider';
import faker, { Attachment, Chapter, Course, Purchase, UserProgress } from '@/types';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { CourseEnrollButton } from './_components/course-enroll-button';
import { CourseProgressButton } from './_components/course-progress-button';

const ChapterIdPage = ({ params }: { params: { slug: string; chapterSlug: string } }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
    const [isLocked, setIsLocked] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedCourse: Course = await getMyCourseBySlug(params.slug);
                const chapter = fetchedCourse.chapters?.find((ch) => ch.slug === params.chapterSlug) || faker.chapters[0];
                setChapter(chapter);
                setAttachments(faker.attachments);
            } catch (error: any) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.slug, params.chapterSlug]);

    return (
        <LoadingProvider isLoading={isLoading}>
            <div>
                {userProgress?.isCompleted && <Banner variant="success" label="You already completed this chapter." />}
                {isLocked && <Banner variant="warning" label="You need to purchase this course to watch this chapter." />}
                {chapter && (
                    <div className="flex flex-col mx-auto border-b">
                        <div className="p-4">
                            <VideoPlayer videoUrl={chapter.videoUrl!} isLocked={isLocked} thumbnail={chapter.thumbnail} />
                        </div>
                        <div>
                            <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                                <h2 className="text-2xl font-semibold mb-2">{chapter.title}</h2>
                                <CourseProgressButton isCompleted={!!userProgress?.isCompleted} />
                            </div>
                            <Separator />
                            <div>
                                <Preview value={chapter.description!} />
                            </div>
                            {!!attachments.length && (
                                <>
                                    <Separator />
                                    <div className="p-4">
                                        {attachments.map((attachment) => (
                                            <a
                                                href={attachment.fileUrl}
                                                target="_blank"
                                                key={attachment.id}
                                                className="flex items-center mb-2 gap-2 p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                                            >
                                                <File />
                                                <p className="line-clamp-1">{attachment.filename}</p>
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </LoadingProvider>
    );
};

export default ChapterIdPage;
