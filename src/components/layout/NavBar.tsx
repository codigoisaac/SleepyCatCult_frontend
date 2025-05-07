"use client";

import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";

export default function NavBar() {
  const { logout } = useAuth();

  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Sleepy Cat Cult</h1>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => {
            toast(
              "You may leave the Cult, but the Cult will never leave you.",
              {
                icon: "🐈‍⬛",
              },
            );
            logout();
          }}
        >
          <small>Logout</small>
        </Button>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
