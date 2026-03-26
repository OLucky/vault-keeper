import { useSessionLogStore } from "../../stores/sessionLogStore";
import styles from "./SidebarToggle.module.css";

export function SidebarToggle() {
  const sidebarOpen = useSessionLogStore((s) => s.sidebarOpen);
  const unseenCount = useSessionLogStore((s) => s.unseenCount);
  const toggleSidebar = useSessionLogStore((s) => s.toggleSidebar);

  return (
    <button className={styles.toggle} onClick={toggleSidebar} type="button">
      Log
      {!sidebarOpen && unseenCount > 0 && <span className={styles.badge}>{unseenCount}</span>}
    </button>
  );
}
