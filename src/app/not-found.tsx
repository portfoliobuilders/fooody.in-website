import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="font-display mt-8 text-4xl font-extrabold">
        This table is empty.
      </h1>
      <p className="mt-3 max-w-md text-mist">
        The page you wanted isn’t plated. Return to the dining room.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to Fooody.in
      </Link>
    </main>
  );
}
