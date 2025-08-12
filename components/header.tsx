// components/header.tsx
import { ModeToggle } from "./mode-toggle";

export function Header() {
  return (
    <header className="p-4 flex justify-between items-center">
      <a href="/" className="text-2xl font-bold text-text dark:text-dark-text">
        Lyricskosh
      </a>
      <ModeToggle />
    </header>
  );
}