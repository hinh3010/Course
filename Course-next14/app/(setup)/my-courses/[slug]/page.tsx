import { getCourseBySlug, getCourses } from "@/actions/course-action";
import faker, { Course } from "@/data";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
    params
}: {
    params: { slug: string; }
}) => {
    const course: Course = await getCourseBySlug(params.slug)
    // return redirect(`/my-courses/${course.slug}/chapters/${course.chapters ? course.chapters[0].id : 'adu'}`);
}

export default CourseIdPage;