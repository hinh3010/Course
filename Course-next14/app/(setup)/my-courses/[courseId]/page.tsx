import faker, { Course } from "@/data";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
    params
}: {
    params: { courseId: string; }
}) => {
    const course: Course = faker.courses[0]


    return redirect(`/my-courses/${course.id}/chapters/${course.chapters ? course.chapters[0].id : 'adu'}`);
}

export default CourseIdPage;