"use client"
import { signUpAction } from "@/actions/auth-action";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { storage } from "@/lib/storage-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    displayName: z.string().min(8, { message: 'Display name must be at least 8 characters long' }),
    email: z.string().email({ message: 'Invalid email format' }).min(1, { message: 'Email is required' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    repeat_password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export default function Page() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            displayName: "",
            email: "",
            password: "",
            repeat_password: "",
        }
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = form

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const { token, refreshToken, ...rest } = await signUpAction(values)
            storage.set('token', token)
            storage.set('refreshToken', refreshToken)
            storage.set('user-info', rest)
            router.push("/");
        } catch (error: any) {
            toast.error(error.message, { position: 'top-right' })
        }
    }

    return (
        <div className="px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-sky-700">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <Form {...form}>
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel
                                        className="text-sm font-medium leading-6 text-sky-700"
                                    >
                                        Display Name
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <Input
                                            className="block border-0 px-4 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel
                                        className="text-sm font-medium leading-6 text-sky-700"
                                    >
                                        Email address
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <Input
                                            className="block border-0 px-4 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="relative">
                                        <FormLabel
                                            className="text-sm font-medium leading-6 text-sky-700"
                                        >
                                            Password
                                        </FormLabel>
                                        <FormControl className="mt-2">
                                            <Input
                                                className="block border-0 pl-4 pr-9 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        {showPassword
                                            ? <EyeOff
                                                className="h-4 w-4 absolute bottom-3 right-3 text-slate-600 cursor-pointer"
                                                onClick={() => setShowPassword(prev => !prev)}
                                            />
                                            : <Eye
                                                className="h-4 w-4 absolute bottom-3 right-3 text-slate-600 cursor-pointer"
                                                onClick={() => setShowPassword(prev => !prev)}
                                            />
                                        }
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="repeat_password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="relative">
                                        <FormLabel
                                            className="text-sm font-medium leading-6 text-sky-700"
                                        >
                                            Repeat Password
                                        </FormLabel>
                                        <FormControl className="mt-2">
                                            <Input
                                                className="block border-0 pl-4 pr-9 py-1.5 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        {showPassword
                                            ? <EyeOff
                                                className="h-4 w-4 absolute bottom-3 right-3 text-slate-600 cursor-pointer"
                                                onClick={() => setShowPassword(prev => !prev)}
                                            />
                                            : <Eye
                                                className="h-4 w-4 absolute bottom-3 right-3 text-slate-600 cursor-pointer"
                                                onClick={() => setShowPassword(prev => !prev)}
                                            />
                                        }
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </Form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    {`Have an account? `}
                    <Link
                        href={'/sign-in'}
                        className="hover:underline font-semibold leading-6 text-sky-700 hover:text-indigo-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}