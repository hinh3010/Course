import { File } from "lucide-react";

import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";

const VideoPlayer = dynamic(() => import('./_components/video-player'), {
    ssr: false,
});

import { CourseEnrollButton } from "./_components/course-enroll-button";
import { CourseProgressButton } from "./_components/course-progress-button";
import faker, { Attachment, Chapter, Course, MuxData, Purchase, UserProgress } from "@/data";
import dynamic from "next/dynamic";
import { getCourseBySlug } from "@/actions/course-action";

const ChapterIdPage = async ({
    params
}: {
        params: { slug: string; chapterId: string }
}) => {
    const course: Course = await getCourseBySlug(params.slug)
    const purchase: Purchase = faker.purchases[0]
    const chapter: Chapter = faker.chapters[0]
    const userProgress: UserProgress = faker.userProgresses[0]
    const nextChapter: Chapter = faker.chapters[1]
    const attachments: Attachment[] = faker.attachments


    const isLocked = !chapter.isFree && !purchase;
    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    return (
        <div>
            {userProgress?.isCompleted && (
                <Banner
                    variant="success"
                    label="You already completed this chapter."
                />
            )}
            {isLocked && (
                <Banner
                    variant="warning"
                    label="You need to purchase this course to watch this chapter."
                />
            )}
            <div className="flex flex-col mx-auto border-b">
                <div className="p-4">
                    <VideoPlayer
                        chapterId={params.chapterId}
                        title={chapter.title}
                        courseId={course._id}
                        nextChapterId={nextChapter?.id}
                        videoUrl={chapter.videoUrl!}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    />
                </div>
                <div>
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                        <h2 className="text-2xl font-semibold mb-2">
                            {chapter.title}
                        </h2>
                        {purchase ? (
                            <CourseProgressButton
                                chapterId={params.chapterId}
                                courseId={course._id}
                                nextChapterId={nextChapter?.id}
                                isCompleted={!!userProgress?.isCompleted}
                            />
                        ) : (
                            <CourseEnrollButton
                                courseId={course._id}
                                price={course.basePrice!}
                            />
                        )}
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
                                        href={attachment.url}
                                        target="_blank"
                                        key={attachment.id}
                                        className="flex items-center mb-2 gap-2 p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                                    >
                                        <File />
                                        <p className="line-clamp-1">
                                            {attachment.name}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChapterIdPage;