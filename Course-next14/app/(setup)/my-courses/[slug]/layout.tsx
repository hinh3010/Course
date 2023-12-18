import { CourseSidebar } from "./_components/course-sidebar";
import faker, { Course } from "@/data";

const CourseLayout = async ({
    children,
}: {
    children: React.ReactNode;
    params: { courseId: string };
}) => {
    const course: Course = faker.courses[0]
    const progressCount = 10

    return (
        <div className="h-full w-full">
            <div className="grid grid-cols-4">
                <main className="col-span-4 xl:col-span-3 flex-1">
                    {children}
                </main>
                <div className="col-span-4 xl:col-span-1 flex-col">
                    <CourseSidebar
                        course={course}
                        progressCount={progressCount}
                    />
                </div>
            </div>
        </div >
    )
}

export default CourseLayout