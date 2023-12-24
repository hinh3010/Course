'use client';
import { CircleDollarSign, File, LayoutDashboard, ListChecks } from 'lucide-react';

import { IconBadge } from '@/components/icon-badge';
import { Banner } from '@/components/banner';

import { TitleForm } from './_components/title-form';
import { DescriptionForm } from './_components/description-form';
import { ImageForm } from './_components/image-form';
import { PriceForm } from './_components/price-form';
import { AttachmentForm } from './_components/attachment-form';
import { ChaptersForm } from './_components/chapters-form';
import { Actions } from './_components/actions';
import { Category, Course } from '@/types';
import { getCourseByMentor } from '@/actions/course-action';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { LoadingProvider } from '@/components/providers/loading-provider';
import { CategoryForm } from './_components/category-form';
import { getServerCategories } from '@/actions/server-action';

const CourseIdPage = ({ params }: { params: { slug: string } }) => {
    const [course, setCourse] = useState<Course | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const [fetchedCourse, fetchedCategories] = await Promise.all([getCourseByMentor(params.slug), getServerCategories()]);
                setCategories(fetchedCategories);
                setCourse(fetchedCourse);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [params.slug]);

    const { isComplete, completionText } = useMemo(() => {
        const { title, description, thumbnail, basePrice, categories, chapters } = course || {};
        const chapterIsPublished = chapters?.some((chapter) => chapter.isPublished);

        const requiredFields = [title, description, thumbnail, basePrice, categories, chapterIsPublished];
        const totalFields = requiredFields.length;
        const completedFields = requiredFields.filter((field) => {
            if (Array.isArray(field)) {
                return field.length > 0;
            }
            return field;
        }).length;

        const completionText = `(${completedFields}/${totalFields})`;

        const isComplete = requiredFields.every((field) => field);

        return { isComplete, completionText };
    }, [course]);

    return (
        <LoadingProvider isLoading={isLoading}>
            {!course?.isPublished && <Banner label="This course is unpublished. It will not be visible to the students." />}
            {course && (
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-y-2">
                            <h1 className="text-2xl font-medium">Course setup</h1>
                            <span className="text-sm text-slate-700">Complete all fields {completionText}</span>
                        </div>
                        <Actions disabled={!isComplete} courseId={course._id} isPublished={course.isPublished} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 mt-16">
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={LayoutDashboard} />
                                <h2 className="text-xl">Customize your course</h2>
                            </div>
                            <TitleForm initialData={course} />
                            <DescriptionForm initialData={course} />
                            <ImageForm initialData={course} />
                            <CategoryForm
                                initialData={course}
                                options={categories.map((category) => ({
                                    label: category.name,
                                    value: category._id,
                                }))}
                            />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={ListChecks} />
                                    <h2 className="text-xl">Course chapters</h2>
                                </div>
                                <ChaptersForm initialData={course} courseId={course._id} />
                            </div>
                            <div>
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={CircleDollarSign} />
                                    <h2 className="text-xl">Sell your course</h2>
                                </div>
                                <PriceForm initialData={course} />
                            </div>
                            <div>
                                <div className="flex items-center gap-x-2">
                                    <IconBadge icon={File} />
                                    <h2 className="text-xl">Resources & Attachments</h2>
                                </div>
                                {/* <AttachmentForm initialData={course} /> */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </LoadingProvider>
    );
};

export default CourseIdPage;
