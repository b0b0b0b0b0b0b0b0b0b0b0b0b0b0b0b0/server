'use client';

import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { getPageAmbience, getTransitionDirection } from '@/lib/config/tools';
import ToolNav from '@/app/components/ToolNav';

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const directionRef = useRef('forward');

  if (prevPathRef.current !== pathname) {
    directionRef.current = getTransitionDirection(prevPathRef.current, pathname);
    prevPathRef.current = pathname;
  }

  const ambience = getPageAmbience(pathname);
  const isToolPage = pathname.startsWith('/tools/');

  return (
    <div className="page-stage" data-ambience={ambience}>
      <div className="page-ambience" aria-hidden />

      <main className="page-stage-inner page-shell">
        {isToolPage && <ToolNav />}
        <div
          key={pathname}
          className="page-transition-panel"
          data-direction={directionRef.current}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
