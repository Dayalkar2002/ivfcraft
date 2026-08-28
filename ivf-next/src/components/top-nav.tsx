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
    return false;
  }

  function hasDropdown(menu: TopNavMenu): boolean {
    return !!(menu.columns?.length || menu.groups?.length || menu.items?.length);
  }

  return (
    <nav ref={navRef} className="hidden flex-1 items-center justify-center gap-1 lg:flex">
      {TOP_NAV_MENUS.map((menu) => (
        <div key={menu.label} className="relative">
          {menu.route && !hasDropdown(menu) ? (
            <Link
              href={menu.route}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive(menu) ? 'bg-brand-light text-brand-green' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {menu.label}
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  openMenu === menu.label ? 'bg-brand-light text-brand-green' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {menu.label} ▾
              </button>
              {openMenu === menu.label && (
                <div
                  className={`absolute left-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white shadow-xl ${
                    menu.columns ? 'w-[720px] max-w-[90vw] p-4' : menu.groups ? 'w-[520px] max-w-[90vw] p-4' : 'min-w-[200px] py-2'
                  }`}
                >
                  {menu.columns && (
                    <div className="grid grid-cols-4 gap-4">
                      {menu.columns.map((column, ci) => (
                        <div key={ci} className="space-y-1">
                          {column.map((item) => (
                            <Link
                              key={item.route}
                              href={item.route}
                              onClick={() => setOpenMenu(null)}
                              className="block rounded px-2 py-1.5 text-xs text-slate-700 hover:bg-brand-light hover:text-brand-green"
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
                          <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {group.label}
                          </div>
                          {group.items.map((item) => (
                            <Link
                              key={item.route}
                              href={item.route}
                              onClick={() => setOpenMenu(null)}
                              className="block rounded px-2 py-1.5 text-xs text-slate-700 hover:bg-brand-light hover:text-brand-green"
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
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
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
