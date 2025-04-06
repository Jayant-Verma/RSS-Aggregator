"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Post } from "@/types/posts";
import axios from "axios";
import Cookies from "js-cookie";
import { Feed } from "@/types/feeds";

export default function SavedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [search, setSearch] = useState("");
    const [selectedFeed, setSelectedFeed] = useState<string>("all");

    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get("authToken");
            const [postsRes, feedsRes] = await Promise.all([
                axios.get("http://localhost:8080/v1/posts", { headers: { Authorization: `Bearer ${token}` } }),
                axios.get("http://localhost:8080/v1/feeds"),
            ]);
            setPosts(postsRes?.data);
            // filters feeds to only those that have posts
            const filteredFeeds = feedsRes?.data.filter((feed: Feed) =>
                postsRes?.data.some((post: Post) => post.feed_id === feed.id)
            );
            setFeeds(filteredFeeds);
            // setFeeds(feedsRes?.data);
        };
        fetchData();
    }, []);

    const getFeedName = (feedId: string) => {
        return feeds.find((feed) => feed.id === feedId)?.name || "Unknown Feed";
    };

    const filteredPosts = posts.filter((post) => {
        const feedName = getFeedName(post.feed_id);
        const matchesSearch =
            post.title.toLowerCase().includes(search.toLowerCase()) ||
            feedName.toLowerCase().includes(search.toLowerCase());
        const matchesFeed = selectedFeed === "all" || post.feed_id === selectedFeed;
        return matchesSearch && matchesFeed;
    });

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-6">
            {/* <div className="mb-6">
                <h1 className="text-2xl font-bold text-indigo-600">Saved Posts</h1>
                <p className="text-sm text-muted-foreground">Explore your saved content below.</p>
            </div> */}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                    placeholder="Search by title or feed name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                />
                <Select value={selectedFeed} onValueChange={setSelectedFeed}>
                    <SelectTrigger className="w-full md:w-60">
                        <SelectValue placeholder="Filter by feed" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Feeds</SelectItem>
                        {feeds.map((feed) => (
                            <SelectItem key={feed.id} value={feed.id}>{feed.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ScrollArea className="h-[70vh] pr-4">
                <div className="grid gap-4">
                    {filteredPosts.length === 0 ? (
                        <div className="text-center text-gray-500">No saved posts found.</div>
                    ) : (
                        filteredPosts.map((post) => (
                            <Card key={post.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-indigo-700 line-clamp-2">
                                            <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {post.title}
                                            </a>
                                        </h2>
                                        {/* <Badge variant="outline" className="ml-4 whitespace-nowrap">{post.title}</Badge> */}
                                    </div>
                                    <p
                                        className="text-sm text-gray-600 mt-2 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: post.description }}
                                    />
                                    <div className="text-xs text-muted-foreground mt-3">Published: {new Date(post.published_at).toLocaleString()}</div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
