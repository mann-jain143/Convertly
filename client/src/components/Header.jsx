import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { dark, toggleTheme } = useTheme();

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
      <div className="text-xl font-bold">Convertly</div>
      <button onClick={toggleTheme} className="glass rounded-full p-2" aria-label="Toggle dark mode">
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}
