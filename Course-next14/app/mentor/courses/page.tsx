'use client';
import { getCoursesByMentor } from '@/actions/course-action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Course } from '@/types';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { columns } from './_components/columns';
import { DataTable } from './_components/data-table';
import { LoadingProvider } from '@/components/providers/loading-provider';
import toast from 'react-hot-toast';

const CoursesPage = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const fetchedCourses = await getCoursesByMentor();
                setCourses(fetchedCourses);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="p-6">
            <div className="flex items-center py-4 justify-between mb-4">
                <Input placeholder="Filter courses..." className="max-w-sm" />
                <Link href="/mentor/courses/create">
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New course
                    </Button>
                </Link>
            </div>
            <LoadingProvider isLoading={isLoading}>
                <DataTable columns={columns} data={courses} />
            </LoadingProvider>
        </div>
    );
};

export default CoursesPage;
