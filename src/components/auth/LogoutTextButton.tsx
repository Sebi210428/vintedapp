"use client";

import { signOut } from "next-auth/react";

type Props = {
  className?: string;
  label?: string;
};

export default function LogoutTextButton({ className, label = "Log out" }: Props) {
  return (
    <button className={className} onClick={() => signOut({ callbackUrl: "/" })} type="button">
      {label}
    </button>
  );
}
