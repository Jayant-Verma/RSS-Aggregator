"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        } 
        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        if (!/\d/.test(formData.password)) {
            toast.error("Password must contain at least one number");
            return;
        }
        if (!/[!@#$%^&*]/.test(formData.password)) {
            toast.error("Password must contain at least one special character");
            return;
        }
        if (!/[A-Z]/.test(formData.password)) {
            toast.error("Password must contain at least one uppercase letter");
            return;
        }
        if (!/[a-z]/.test(formData.password)) {
            toast.error("Password must contain at least one lowercase letter");
            return;
        }
        if (!/^[a-zA-Z0-9!@#$%^&*]+$/.test(formData.password)) {
            toast.error("Password can only contain letters, numbers, and special characters");
            return;
        }
        if (formData.password.length > 20) {
            toast.error("Password must be at most 20 characters long");
            return;
        }

        setLoading(true);
        try {
            await axios.post("http://localhost:8080/v1/auth/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });
            toast.success("Account created! You can now login.");
            router.push("/login");
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                toast.error(err.response.data?.message || "Registration failed");
            } else {
                toast.error("Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full">
            {/* Background Illustration */}
            <Image
                src="login.svg"
                alt="Register"
                fill
                className="object-contain w-full h-full"
                priority
            />

            <div className="absolute inset-0 bg-black/40 z-10" />

            {/* Register Form */}
            <div className="absolute inset-0 z-20 flex items-center justify-center">
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white text-center">Create Account</CardTitle>
                        <p className="text-sm text-white/80 text-center">Join us to explore personalized content feeds</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                name="name"
                                placeholder="Your name"
                                className="text-white placeholder:text-white/50 bg-transparent border-b-2 border-white focus:outline-none focus:ring-0 focus:border-indigo-600"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="email"
                                type="email"
                                placeholder="Email"
                                className="text-white placeholder:text-white/50 bg-transparent border-b-2 border-white focus:outline-none focus:ring-0 focus:border-indigo-600"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="text-white placeholder:text-white/50 bg-transparent border-b-2 border-white focus:outline-none focus:ring-0 focus:border-indigo-600"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                className="text-white placeholder:text-white/50 bg-transparent border-b-2 border-white focus:outline-none focus:ring-0 focus:border-indigo-600"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                                {loading ? "Creating..." : "Register"}
                            </Button>
                        </form>
                        <p className="text-sm text-center text-white/80 mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white underline hover:text-indigo-200">
                                Login
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
