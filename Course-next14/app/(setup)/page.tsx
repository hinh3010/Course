import { getServerCategories, getServerCourses } from "@/actions/server-action";
import { CoursesList } from "@/components/courses-list";
import { SearchInput } from "@/components/search-input";
import { Category, Course } from "@/types";
import { Categories } from "./_components/categories";

const CoursesPage = async () => {
    const categories: Category[] = await getServerCategories()
    const courses: Course[] = await getServerCourses()

    return (
        <>
            <div className="px-6 pt-6 md:hidden md:mb-0 block">
                <SearchInput />
            </div>
            <div className="p-6 space-y-4">
                <Categories
                    items={categories}
                />
                <CoursesList items={courses} />
            </div>
        </>
    );
}

export default CoursesPage;