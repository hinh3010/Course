'use client'
import { CourseCard } from "@/components/course-card";
import { Course } from "@/data";

type CourseWithProgressWithCategory = Course

interface CoursesListProps {
    items: CourseWithProgressWithCategory[];
}

export const CoursesList = ({
    items
}: CoursesListProps) => {
    return (
        <>
            <div className="grid sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {items.map((item) => (
                    <CourseCard
                        key={item._id}
                        id={item._id}
                        slug={item.slug}
                        title={item.title}
                        imageUrl={item.thumbnail!}
                        price={item.basePrice}
                        progress={10}
                        chaptersLength={item.chapters?.length || 0}
                        categories={item.categories}
                    />
                ))}
            </div>
            {items.length === 0 && (
                <div className="text-center text-sm text-muted-foreground mt-10">
                    No courses found
                </div>
            )}
        </>
    )
}