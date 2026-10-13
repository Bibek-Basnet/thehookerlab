import type { Metadata } from "next";
import Image from "next/image";

import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="w-full max-w-sm rounded-[1.75rem] border border-line bg-coal p-8">
        <Image
          src="/logo/logo.png"
          alt="The Hooker Lab"
          width={56}
          height={56}
          className="mb-6"
        />
        <h1 className="font-display text-3xl">Admin</h1>
        <p className="mt-2 text-sm text-mist">Sign in to edit the site.</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
