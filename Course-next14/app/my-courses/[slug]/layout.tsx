'use client';
import { getMyCourseBySlug } from '@/actions/course-action';
import { Course } from '@/types';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CourseSidebar } from './_components/course-sidebar';
import { useRouter, usePathname, redirect } from 'next/navigation';
import { LoadingProvider } from '@/components/providers/loading-provider';

const CourseLayout = ({ children, params }: { children: React.ReactNode; params: { slug: string } }) => {
    const router = useRouter();
    const pathName = usePathname();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const course: Course = await getMyCourseBySlug(params.slug);
                setCourse(course);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourse();
    }, [params.slug, router]);

    useEffect(() => {
        if (course && pathName === `/my-courses/${params.slug}`) {
            redirect(`/my-courses/${params.slug}/chapters/${course.chapters ? course.chapters[0]._id : 'adu'}`);
        }
    }, [pathName, params.slug, course]);

    const progressCount = 10;

    return (
        <div className="h-full w-full">
            <div className="grid grid-cols-4">
                <main className="col-span-4 xl:col-span-3 flex-1">
                    <LoadingProvider isLoading={isLoading}>{children}</LoadingProvider>
                </main>
                <div className="col-span-4 xl:col-span-1 flex-col">{course && <CourseSidebar course={course} progressCount={progressCount} />}</div>
            </div>
        </div>
    );
};

export default CourseLayout;
