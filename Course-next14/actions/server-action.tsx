import { fetchActions } from "@/lib/fetch-actions";
import { Category, Course } from "@/types";

export const getServerCourses = async (): Promise<Course[]> => {
    return await fetchActions.get('courses')
};

export const getServerCourseBySlug = async (slug: string): Promise<Course> => {
    return await fetchActions.get(`courses/slug/${slug}`)
};

export const getServerCategories = async (): Promise<Category[]> => {
    return await fetchActions.get('categories');
};
