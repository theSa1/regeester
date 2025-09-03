import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const proseClasses = cn(
  "prose text-foreground max-w-none focus:outline-none",
  "prose-headings:my-3 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-2 prose-blockquote:my-2",
  "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
  "prose-p:font-medium prose-strong:font-bold"
);
