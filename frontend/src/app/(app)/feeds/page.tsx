"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { FollowedFeed } from "@/types/followed_feeds";
import { Feed } from "@/types/feeds";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function FeedsPage() {
    const [feeds, setFeeds] = useState<Feed[]>([]);
    const [followedFeedIds, setFollowedFeedIds] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "followed">("all");
    const [newFeedData, setNewFeedData] = useState({
        name: "",
        url: "",
    });

    useEffect(() => {
        const fetchFeeds = async () => {
            try {
                const token = Cookies.get("authToken");
                const [allFeeds, followed] = await Promise.all([
                    axios.get("http://localhost:8080/v1/feeds"),
                    axios.get("http://localhost:8080/v1/feed_follows", { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                setFeeds(allFeeds.data);
                setFollowedFeedIds(new Set(followed.data.map((f: FollowedFeed) => f.feed_id)));
            } catch (err) {
                console.error("Error fetching feeds", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeeds();
    }, []);

    const handleToggleFollow = async (feedId: string) => {
        const token = Cookies.get("authToken");
        try {
            if (followedFeedIds.has(feedId)) {
                await axios.delete(`http://localhost:8080/v1/feed_follows/${feedId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFollowedFeedIds((prev) => {
                    const updated = new Set(prev);
                    updated.delete(feedId);
                    return updated;
                });
            } else {
                await axios.post(
                    `http://localhost:8080/v1/feed_follows`,
                    { feed_id: feedId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFollowedFeedIds((prev) => new Set(prev).add(feedId));
            }
        } catch (err) {
            console.error("Error toggling follow status", err);
        }
    };

    const handleAddFeed = async () => {
        if (!newFeedData?.url.trim()) return;
        const token = Cookies.get("authToken");
        try {
            const res = await axios.post(
                "http://localhost:8080/v1/feeds",
                { name: newFeedData.name, url: newFeedData.url },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFeeds((prev) => [...prev, res.data]);
            setNewFeedData({ name: "", url: "" });
            setFollowedFeedIds((prev) => new Set(prev).add(res.data.id));
        } catch (err) {
            console.error("Error adding feed", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredFeeds = feeds.filter(feed => {
        const matchesSearch = feed.name.toLowerCase().includes(search.toLowerCase());
        const isFollowed = followedFeedIds.has(feed.id);
        return matchesSearch && (filter === "all" || isFollowed);
    });

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-teal-600">Feeds</h1>
                    <p className="text-sm text-gray-500">Manage your feeds and follow/unfollow them.</p>
                </div>

                <div className="flex items-center gap-2">
                    <ToggleGroup
                        type="single"
                        value={filter}
                        onValueChange={(val: "all" | "followed") => val && setFilter(val)}
                    >
                        <ToggleGroupItem value="all" className="px-4 py-2">
                            All
                        </ToggleGroupItem>
                        <ToggleGroupItem value="followed" className="px-4 py-2">
                            Followed
                        </ToggleGroupItem>
                    </ToggleGroup>
                    
                    <Input
                        placeholder="Search feeds..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-64"
                    />

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4" />
                                Add Feed
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add a New Feed</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input id="name" value={newFeedData.name} onChange={(e) => setNewFeedData({ ...newFeedData, name: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="url" className="text-right">
                                        URL
                                    </Label>
                                    <Input id="url" value={newFeedData.url} onChange={(e) => setNewFeedData({ ...newFeedData, url: e.target.value })} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddFeed}>Add</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                </div>
            ) : filteredFeeds.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No feeds found.</div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {filteredFeeds.map(feed => (
                        <Card key={feed.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-teal-700 truncate">
                                        {feed.name}
                                    </h2>
                                    {followedFeedIds.has(feed.id) && (
                                        <Badge variant="outline" className="text-xs text-green-600 border-green-400">
                                            Following
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{feed.description}</p>
                                <a
                                    href={feed.url}
                                    target="_blank"
                                    className="text-sm text-teal-600 hover:underline"
                                >
                                    Visit Feed
                                </a>
                                <Button
                                    size="sm"
                                    className="w-full mt-2"
                                    variant={followedFeedIds.has(feed.id) ? "secondary" : "default"}
                                    onClick={() => handleToggleFollow(feed.id)}
                                >
                                    {followedFeedIds.has(feed.id) ? "Unfollow" : "Follow"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
