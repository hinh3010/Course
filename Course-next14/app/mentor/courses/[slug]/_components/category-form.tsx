'use client';
import { Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Select, { MultiValue } from 'react-select';

import { updateCourse } from '@/actions/course-action';
import { Button } from '@/components/ui/button';
import { Course } from '@/types';

interface CategoryFormProps {
    initialData: Course;
    options: { label: string; value: string }[];
}

export const CategoryForm = ({ initialData, options }: CategoryFormProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [values, setValues] = useState<MultiValue<{ label: string; value: string }>>([]);

    const toggleEdit = () => setIsEditing((current) => !current);

    const defaultCategories = useMemo(() => {
        const categories = initialData.categories?.map((category) => ({
            label: category.name,
            value: category._id,
        }));
        return categories;
    }, [initialData.categories]);

    const onSubmit = async () => {
        try {
            const categoryIds = values.map((value) => value.value);
            await updateCourse(initialData._id, { categories: categoryIds });
            toast.success('Course updated successfully');
            toggleEdit();
        } catch {
            toast.error('Something went wrong');
        }
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
                onChange={(values) => setValues(values)}
                isDisabled={!isEditing}
                defaultValue={defaultCategories}
            />
            {isEditing && (
                <div className="flex items-center gap-x-2">
                    <Button onClick={onSubmit} type="submit">
                        Save
                    </Button>
                </div>
            )}
        </div>
    );
};
