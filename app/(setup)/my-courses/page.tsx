import { SearchInput } from "@/components/search-input";
import { CoursesList } from "@/components/courses-list";

import faker, { Category, Course } from "@/data";
import { CheckCircle, Clock } from "lucide-react";
import { InfoCard } from "./_components/info-card";

const MyCoursesPage = async () => {
    const categories: Category[] = faker.categories

    const courses: Course[] = faker.courses

    return (
        <>
            <div className="px-6 pt-6 md:hidden md:mb-0 block">
                <SearchInput />
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                        icon={Clock}
                        label="In Progress"
                        numberOfItems={20}
                    />
                    <InfoCard
                        icon={CheckCircle}
                        label="Completed"
                        numberOfItems={15}
                        variant="success"
                    />
                </div>
                <CoursesList items={courses} />
            </div>
        </>
    );
}

export default MyCoursesPage;