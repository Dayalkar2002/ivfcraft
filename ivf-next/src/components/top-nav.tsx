'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { TopNavMenu } from '@/lib/nav-config';
import { TOP_NAV_MENUS } from '@/lib/nav-config';

export function TopNav() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function isActive(menu: TopNavMenu): boolean {
    if (menu.route) return pathname === menu.route || pathname.startsWith(`${menu.route}/`);
    if (menu.items?.some((i) => pathname === i.route || pathname.startsWith(`${i.route}/`))) return true;
    if (menu.groups?.some((g) => g.items.some((i) => pathname.startsWith(i.route)))) return true;
    if (menu.label === 'Master' && pathname.startsWith('/masters')) return true;
    return false;
  }

  function hasDropdown(menu: TopNavMenu): boolean {
    return !!(menu.columns?.length || menu.groups?.length || menu.items?.length);
  }

  return (
    <nav ref={navRef} className="hidden flex-1 items-center gap-1 xl:flex">
      {TOP_NAV_MENUS.map((menu) => (
        <div key={menu.label} className="relative">
          {menu.route && !hasDropdown(menu) ? (
            <Link
              href={menu.route}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive(menu)
                  ? 'bg-brand-mist text-brand-dark'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {menu.label}
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  openMenu === menu.label || isActive(menu)
                    ? 'bg-brand-mist text-brand-dark'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {menu.label}
                <span className="ml-1 text-[10px] opacity-60">▾</span>
              </button>
              {openMenu === menu.label && (
                <div
                  className={`absolute left-0 top-full z-50 mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl ${
                    menu.columns
                      ? 'w-[760px] max-w-[92vw] p-5'
                      : menu.groups
                        ? 'w-[560px] max-w-[92vw] p-5'
                        : 'min-w-[220px] py-2'
                  }`}
                >
                  {menu.columns && (
                    <div className="grid grid-cols-4 gap-4">
                      {menu.columns.map((column, ci) => (
                        <div key={ci} className="space-y-0.5">
                          {column.map((item) => (
                            <Link
                              key={item.route + item.label}
                              href={item.route}
                              onClick={() => setOpenMenu(null)}
                              className="block rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-brand-mist hover:text-brand-dark"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {menu.groups && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {menu.groups.map((group) => (
                        <div key={group.label}>
                          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {group.label}
                          </div>
                          {group.items.map((item) => (
                            <Link
                              key={item.route}
                              href={item.route}
                              onClick={() => setOpenMenu(null)}
                              className="block rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-brand-mist hover:text-brand-dark"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                  {menu.items?.map((item) => (
                    <Link
                      key={item.route}
                      href={item.route}
                      onClick={() => setOpenMenu(null)}
                      className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-mist hover:text-brand-dark"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </nav>
  );
}
