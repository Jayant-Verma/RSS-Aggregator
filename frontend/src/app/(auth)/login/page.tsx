"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
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
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full">
            <Image
                src="login.svg"
                alt="Illustration"
                fill
                className="object-contain w-full h-full"
                priority
            />

            <div className="absolute inset-0 bg-black/40 z-10" />

            <div className="absolute inset-0 z-20 flex items-center justify-center">
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white text-center">Welcome 👋</CardTitle>
                        <p className="text-sm text-white/80 text-center">Personalize your reading experience with curated feeds.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white">Email</label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                className="text-white placeholder:text-white/50 bg-transparent border-b-2 border-white focus:outline-none focus:ring-0 focus:border-indigo-600"
                                onChange={(e) => setEmail(e.target.value)}
                                />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="text-white placeholder:text-white/50 bg-transparent border-b-2 border-white focus:outline-none focus:ring-0 focus:border-indigo-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                        <p className="text-sm text-center text-white/80">
                            Don’t have an account?{' '}
                            <Link href="/register" className="text-white underline hover:text-indigo-200">
                                Register
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}