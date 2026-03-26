import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { HamburgerMenu } from "../components/HamburgerMenu/HamburgerMenu";
import { SidebarToggle } from "../components/SidebarToggle/SidebarToggle";
import { SessionLogSidebar } from "../components/SessionLogSidebar/SessionLogSidebar";
import { useSessionLogStore } from "../stores/sessionLogStore";
import { useAuthStore } from "../stores/authStore";
import { AuthScreen } from "../components/AuthScreen/AuthScreen";
import styles from "./Root.module.css";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
});

function RootLayout() {
  const sidebarOpen = useSessionLogStore((s) => s.sidebarOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const authRequired = import.meta.env.VITE_APP_PASSWORD;
  if (authRequired && !isAuthenticated) return <AuthScreen />;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.logo}>
            Vault Keeper
          </Link>
          <span className={styles.hamburger}>
            <HamburgerMenu />
          </span>
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
  );
}
