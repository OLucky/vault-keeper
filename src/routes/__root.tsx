import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { SidebarToggle } from '../components/SidebarToggle/SidebarToggle'
import { SessionLogSidebar } from '../components/SessionLogSidebar/SessionLogSidebar'
import { useSessionLogStore } from '../stores/sessionLogStore'
import styles from './Root.module.css'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
})

function RootLayout() {
  const sidebarOpen = useSessionLogStore((s) => s.sidebarOpen)

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            Vault Keeper
          </Link>
          <Link to="/saved" className={styles.navLink}>
            Saved
          </Link>
          <SidebarToggle />
        </nav>
      </header>
      <div className={styles.content}>
        <main className={styles.main}>
          <Outlet />
        </main>
        {sidebarOpen && <SessionLogSidebar />}
      </div>
    </div>
  )
}
