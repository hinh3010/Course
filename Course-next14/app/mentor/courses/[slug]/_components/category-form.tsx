'use client';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Select, { MultiValue } from 'react-select';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Course } from '@/types';

interface CategoryFormProps {
    initialData: Course;
    options: { label: string; value: string }[];
}

const formSchema = z.object({
    categories: z.array(z.string()).nonempty(),
});

export const CategoryForm = ({ initialData, options }: CategoryFormProps) => {
    const [isEditing, setIsEditing] = useState(true);

    const toggleEdit = () => setIsEditing((current) => !current);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            toast.success('Course updated');
            toggleEdit();
        } catch {
            toast.error('Something went wrong');
        }
    };

    const onSelect = (values: MultiValue<{ label: string; value: string }>) => {
        console.log({ values });
    };

    return (
        <div className="mt-6 border bg-slate-100 rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                Course category
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit category
                        </>
                    )}
                </Button>
            </div>
            <Select
                options={options}
                isMulti
                name="categories"
                className="basic-multi-select space-y-4 mt-4"
                classNamePrefix="select"
                onChange={onSelect}
                isDisabled={!isEditing}
            />
            {isEditing && (
                <div className="flex items-center gap-x-2">
                    <Button type="submit">Save</Button>
                </div>
            )}
        </div>
    );
};
