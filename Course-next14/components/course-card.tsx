'use client'

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { IconBadge } from "@/components/icon-badge";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "@/components/course-progress";
import { Category } from "@/types";

interface CourseCardProps {
    id: string;
    title: string;
    imageUrl: string;
    chaptersLength: number;
    price: number;
    progress: number | null;
    categories: Category[];
    slug: string
};

export const CourseCard = ({
    title,
    imageUrl,
    chaptersLength,
    price,
    progress,
    categories,
    slug
}: CourseCardProps) => {
    return (
        <Link href={`/my-courses/${slug}`}>
            <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                    <Image
                        fill
                        className="object-cover"
                        alt={title}
                        src={imageUrl}
                    />
                </div>
                <div className="flex flex-col pt-2">
                    <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
                        {title}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {
                            categories.map(category => (
                                <span key={category._id} className="text-xs text-muted-foreground border py-1 px-2 rounded-2xl">
                                    {category.name}
                                </span>
                            ))
                        }
                    </div>
                    <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
                        <div className="flex items-center gap-x-1 text-slate-500">
                            <IconBadge size="sm" icon={BookOpen} />
                            <span>
                                {chaptersLength} {chaptersLength >= 1 ? "Chapter" : "Chapters"}
                            </span>
                        </div>
                    </div>
                    {(progress === 0 || progress) ? (
                        <CourseProgress
                            variant={progress === 100 ? "success" : "default"}
                            size="sm"
                            value={progress}
                        />
                    ) : (
                        <p className="text-md md:text-sm font-medium text-slate-700">
                            {formatPrice(price)}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    )
}