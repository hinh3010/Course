import { getCourses } from "@/actions/course-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Course } from "@/types";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

const CoursesPage = async () => {
    const courses: Course[] = await getCourses()

    return (
        <div className="p-6">
            <div className="flex items-center py-4 justify-between">
                <Input
                    placeholder="Filter courses..."
                    className="max-w-sm"
                />
                <Link href="/mentor/courses/create">
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New course
                    </Button>
                </Link>
            </div>
            <DataTable columns={columns} data={courses} />
        </div>
    );
}

export default CoursesPage;