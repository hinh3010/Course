import { SearchInput } from "@/components/search-input";
import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";
import faker, { Category, Course } from "@/data";

const CoursesPage = async () => {
    const categories: Category[] = faker.categories

    const courses: Course[] = faker.courses

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