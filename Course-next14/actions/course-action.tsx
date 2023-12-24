import { axiosActions } from '@/lib/axios-actions';
import { Course } from '@/types';

export const getCourses = async (): Promise<Course[]> => {
    return await axiosActions.get('courses');
};

export const getCourseBySlug = async (slug: string) => {
    return await axiosActions.get(`courses/slug/${slug}`);
};

//
export const getMyCourses = async (): Promise<Course[]> => {
    return await axiosActions.get('my-courses');
};

export const getMyCourseBySlug = async (slug: string): Promise<Course> => {
    return await axiosActions.get(`my-courses/${slug}`);
};

export const getCoursesByMentor = async (): Promise<Course[]> => {
    return await axiosActions.get('mentor/courses');
};

export const getCourseByMentor = async (slug: string): Promise<Course> => {
    return await axiosActions.get(`mentor/courses/${slug}`);
};

export const updateCourse = async (id: string, values: any): Promise<Course> => {
    return await axiosActions.patch(`mentor/courses/${id}`, values);
};
