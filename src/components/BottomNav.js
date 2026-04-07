"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={pathname === '/' ? styles.active : styles.navLink}>
        <span className={styles.label}>DASHBOARD</span>
      </Link>
      
      <Link href="/suggestions" className={pathname === '/suggestions' ? styles.active : styles.navLink}>
        <span className={styles.label}>COACH</span>
      </Link>
      
      <Link href="/settings" className={pathname === '/settings' ? styles.active : styles.navLink}>
        <span className={styles.label}>PROFILE</span>
      </Link>
    </nav>
  );
}
