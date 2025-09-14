"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/quizify", label: "New Quiz" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/quiz_sessions", label: "Results" },
];

export function Nav() {
  const pathname = usePathname() ?? "/";

  const items = NAV_ITEMS.filter((item) => item.href !== pathname);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="container mx-auto max-w-2xl p-6 pt-4">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}

