import Image from "next/image";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 w-full h-[100vh]">
            <div className="flex min-h-full justify-center px-6 py-12 lg:px-8 absolute md:relative">
                <Image
                    src="/svg/banner-dark.svg"
                    alt=""
                    priority
                    width="600"
                    height="600"
                    className="h-auto w-auto opacity-10 md:opacity-100 contain"
                />
            </div>
            <div className="z-20 flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                {" "}
                {children}
            </div>
        </div>
    );
}
