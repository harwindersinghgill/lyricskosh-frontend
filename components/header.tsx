// components/header.tsx
import { ModeToggle } from "./mode-toggle";

export function Header() {
  return (
    <header className="py-4 px-8 w-full max-w-4xl mx-auto flex justify-between items-center">
      <a href="/" className="text-2xl font-bold hover:text-primary dark:hover:text-dark-primary transition-colors">
        Lyricskosh
      </a>
      <ModeToggle />
    </header>
  );
}