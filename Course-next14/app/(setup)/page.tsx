import { SearchInput } from "@/components/search-input";
import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";
import faker, { Category, Course } from "@/data";
import { getCourses } from "@/actions/course-action";
import { getCategories } from "@/actions/category-action";

const CoursesPage = async () => {
    const categories: Category[] = await getCategories()
    const courses: Course[] = await getCourses()

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