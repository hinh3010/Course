import { LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SearchInput } from "./search-input";

export const NavbarRoutes = () => {

    return (
        <>
            <div className="hidden md:block">
                <SearchInput />
            </div>
            <div className="flex gap-x-2 ml-auto">
                {/* <Link href="/">
                    <Button size="sm" variant="ghost">
                        <LogOut className="h-4 w-4 mr-2" />
                        Exit
                    </Button>
                </Link>
                <Link href="/courses">
                    <Button size="sm" variant="ghost">
                        Teacher mode
                    </Button>
                </Link> */}
            </div>
        </>
    )
}