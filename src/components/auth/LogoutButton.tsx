"use client";

import { signOut } from "next-auth/react";

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <button
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
      type="button"
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
    </button>
  );
}

