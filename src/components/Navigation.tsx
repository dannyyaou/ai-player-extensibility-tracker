'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/coverage', label: 'Coverage Matrix' },
];

const vendorLinks = [
  { href: '/vendor/microsoft', label: 'Microsoft' },
  { href: '/vendor/google', label: 'Google' },
  { href: '/vendor/anthropic', label: 'Anthropic' },
  { href: '/vendor/openai', label: 'OpenAI' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">CE</span>
            </div>
            <span className="font-semibold text-slate-900 hidden sm:block">
              Copilot Extensibility Tracker
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <span className="mx-1 h-5 w-px bg-slate-200" />
            {vendorLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
