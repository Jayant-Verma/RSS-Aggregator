"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Rss, Bookmark, Settings, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import axios from "axios";

const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/feeds", label: "Feeds", icon: Rss },
    { href: "/posts", label: "Posts", icon: Bookmark },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
    const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        Cookies.remove("authToken");
        Cookies.remove("userEmail");
        Cookies.remove("userName");
        window.location.href = "/login";
    };

    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get("authToken");
            if (!token) return;

            try {
                const response = await axios.get("http://localhost:8080/v1/user/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        };

        fetchUser();
    }, []);

    return (
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
            <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu (Mobile Only) */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold text-indigo-600">
                        RSS Aggregator
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-1 hover:text-indigo-600 ${pathname === href ? "text-indigo-600 font-medium" : ""
                                    }`}
                            >
                                <Icon className="w-4 h-4" /> {label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* User Avatar Dropdown */}
                {user &&
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="rounded-full">
                                <Avatar>
                                    <AvatarImage src={user.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} alt={user.name} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                <div className="text-sm font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/settings"
                                    className="w-full flex items-center gap-2"
                                >
                                    <Settings className="w-4 h-4" /> Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-red-500 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            </div>

            {/* Mobile Navigation Drawer */}
            {menuOpen && (
                <div className="md:hidden px-4 py-2 border-t bg-white">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className={`py-2 flex items-center gap-2 text-sm ${pathname === href ? "text-indigo-600 font-medium" : "text-gray-700"
                                } hover:text-indigo-600`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}