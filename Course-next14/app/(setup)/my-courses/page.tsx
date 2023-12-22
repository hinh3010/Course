'use client'
import { CoursesList } from "@/components/courses-list";
import { SearchInput } from "@/components/search-input";

import { getMyCourses } from "@/actions/course-action";
import { Course } from "@/types";
import { CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { InfoCard } from "./_components/info-card";

const MyCoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const fetchedCourses = await getMyCourses();
                setCourses(fetchedCourses);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

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
                {isLoading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>Error: {error.message}</div>
                ) : (
                    <CoursesList items={courses} />
                )}
            </div>
        </>
    );
}

export default MyCoursesPage;