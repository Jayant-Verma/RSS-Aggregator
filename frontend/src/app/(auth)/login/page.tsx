"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/v1/auth/login", {
                email,
                password,
            });

            const { token } = response.data;

            Cookies.set("authToken", token, {
                expires: 7, // days
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
            });

            console.log("Login successful:", response?.data);
            toast.success("Login successful!");
            router.push("/");
        }
        catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Login failed:", error.response?.data || error.message);
                toast.error("Login failed. Please check your credentials.");
            } else {
                console.error("An unexpected error occurred:", error);
                toast.error("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-indigo-500 via-blue-500 to-green-500 p-4">
            <Card className="w-full max-w-md shadow-lg border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gray-900">
                        RSS Feed Aggregator
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email" className="text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-gray-700">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                            Sign In
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <a href="/register" className="text-indigo-500 hover:underline">
                            Sign up
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}