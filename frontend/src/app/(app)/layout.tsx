import type { Metadata } from "next";
import Navbar from "@/components/custom/Navbar";


export const metadata: Metadata = {
  title: "RSS Feed Aggregator",
  description: "A simple RSS feed aggregator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <main>
        <Navbar />
        <main>{children}</main>
      </main>
  );
}
