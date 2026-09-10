import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        id="main"
        className="relative z-[2] flex min-h-[70vh] flex-col items-center justify-center px-6 py-28 text-center"
      >
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
      <Footer />
    </>
  );
}
