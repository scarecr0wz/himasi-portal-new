import { useState } from "react";
import { avatarUrl } from "@/lib/auth";

type Props = {
  avatar: string | null | undefined;
  className?: string;
  iconClassName?: string;
};

/** Renders user avatar image with same-origin URL and fallback to person icon on load error. */
export default function Avatar({ avatar, className = "w-10 h-10 rounded-full", iconClassName = "text-primary text-2xl" }: Props) {
  const [errored, setErrored] = useState(false);
  const src = avatarUrl(avatar);

  if (!src || errored) {
    return (
      <span
        className={`flex items-center justify-center bg-primary/10 overflow-hidden shrink-0 ${className}`}
        aria-hidden
      >
        <span className={`material-symbols-outlined ${iconClassName}`}>person</span>
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={`object-cover shrink-0 ${className}`}
      onError={() => setErrored(true)}
    />
  );
}
