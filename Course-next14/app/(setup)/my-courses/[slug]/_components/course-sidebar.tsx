import { CourseProgress } from '@/components/course-progress';

import faker, { Course } from '@/types';
import { CourseSidebarItem } from './course-sidebar-item';

interface CourseSidebarProps {
    course: Course;
    progressCount: number;
}

export const CourseSidebar = ({ course, progressCount }: CourseSidebarProps) => {
    const purchase = faker.purchases[0];

    return (
        <div className="h-full border flex flex-col overflow-y-auto shadow-sm">
            <div className="p-4 flex flex-col border-b">
                <h1 className="font-semibold">{course.title}</h1>
                {purchase && (
                    <div className="mt-4">
                        <CourseProgress variant="success" value={progressCount} />
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full">
                {course.chapters?.map((chapter) => (
                    <CourseSidebarItem
                        key={chapter._id}
                        id={chapter._id}
                        label={chapter.title}
                        isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                        courseId={course._id}
                        isLocked={!chapter.isFree && !purchase}
                    />
                ))}
            </div>
        </div>
    );
};
