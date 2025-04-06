"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Rss,
  Bookmark,
  PlusCircle,
  RefreshCcw,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FollowedFeed } from "@/types/followed_feeds";
import { Feed } from "@/types/feeds";

interface Post {
  id: string;
  title: string;
  url: string;
  feed_id: string;
  published_at: string;
}

export default function Dashboard() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedsRes, followsRes, postsRes] = await Promise.all([
          axios.get("http://localhost:8080/v1/feeds"),
          axios.get("http://localhost:8080/v1/feed_follows", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/v1/posts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const followedFeedIds = followsRes.data.map((f: FollowedFeed) => f.feed_id);
        const followedFeeds = feedsRes.data.filter((feed: Feed) =>
          followedFeedIds.includes(feed.id)
        );
        const userPosts = postsRes.data.filter((post: Post) =>
          followedFeedIds.includes(post.feed_id)
        );

        setFeeds(followedFeeds);
        setPosts(userPosts);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-600">Dashboard</h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Rss className="text-indigo-600" />
            <div>
              <p className="text-sm text-muted-foreground">Feeds Followed</p>
              <p className="text-lg font-semibold">{feeds.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Bookmark className="text-indigo-600" />
            <div>
              <p className="text-sm text-muted-foreground">Saved Posts</p>
              <p className="text-lg font-semibold">{posts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Settings className="text-indigo-600" />
            <div>
              <p className="text-sm text-muted-foreground">Quick Settings</p>
              <Link
                href="/settings"
                className="text-indigo-600 text-sm hover:underline"
              >
                Manage →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Updated Feeds */}
      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <RefreshCcw className="w-5 h-5" /> Recently Updated Feeds
        </h2>
        {loading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : feeds.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You&apos;re not following any feeds yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeds
              .sort(
                (a, b) =>
                  new Date(b.updated_at).getTime() -
                  new Date(a.updated_at).getTime()
              )
              .slice(0, 3)
              .map((feed) => (
                <Card key={feed.id}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-indigo-700">
                      {feed.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-1 break-all">
                      {feed.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Updated{" "}
                      {formatDistanceToNow(new Date(feed.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Navigation Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Link href="/feeds">
          <Card className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center gap-3">
              <PlusCircle className="text-indigo-600" />
              <span>Explore Feeds</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/my-feeds">
          <Card className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center gap-3">
              <Rss className="text-indigo-600" />
              <span>My Feeds</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/posts">
          <Card className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center gap-3">
              <Bookmark className="text-indigo-600" />
              <span>Saved Posts</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings">
          <Card className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center gap-3">
              <Settings className="text-indigo-600" />
              <span>Settings</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}