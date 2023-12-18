import { CourseProgress } from "@/components/course-progress";

import faker, { Course } from "@/data";
import { CourseSidebarItem } from "./course-sidebar-item";

interface CourseSidebarProps {
    course: Course;
    progressCount: number;
};

export const CourseSidebar = async ({
    course,
    progressCount,
}: CourseSidebarProps) => {
    const purchase = faker.purchases[0]

    return (
        <div className="h-full border-l flex flex-col overflow-y-auto shadow-sm">
            <div className="p-4 flex flex-col border-b">
                <h1 className="font-semibold">
                    {course.title}
                </h1>
                {purchase && (
                    <div className="mt-4">
                        <CourseProgress
                            variant="success"
                            value={progressCount}
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full">
                {course.chapters?.map((chapter) => (
                    <CourseSidebarItem
                        key={chapter.id}
                        id={chapter.id}
                        label={chapter.title}
                        isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                        courseId={course.id}
                        isLocked={!chapter.isFree && !purchase}
                    />
                ))}
            </div>
        </div>
    )
}