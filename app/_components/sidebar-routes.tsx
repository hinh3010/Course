"use client";
import { BarChart, Compass, Layout, List, Computer } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";

const routes = [
    {
        icon: Layout,
        label: "Courses",
        href: "/",
    },
    {
        icon: List,
        label: "My Courses",
        href: "/my-courses",
    },
    {
        icon: BarChart,
        label: "Analytics",
        href: "/analytics",
    },
    {
        icon: Compass,
        label: "Publish",
        href: "/mentor/courses",
    }
]

export const SidebarRoutes = () => {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-full">
            {routes.map((route) => (
                <SidebarItem
                    key={route.href}
                    icon={route.icon}
                    label={route.label}
                    href={route.href}
                />
            ))}
        </div>
    )
}