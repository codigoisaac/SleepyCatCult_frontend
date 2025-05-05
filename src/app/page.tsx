"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect based on token existence
    const token = Cookies.get("token");

    if (token) {
      router.push("/movies");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Cubos Movies</h1>
        <div className="animate-pulse">Loading...</div>
      </div>
    </div>
  );
}
