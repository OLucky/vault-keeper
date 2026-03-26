import { DialogTrigger, Popover, Button, Dialog } from "react-aria-components";
import { Link } from "@tanstack/react-router";
import styles from "./HamburgerMenu.module.css";

export function HamburgerMenu() {
  return (
    <DialogTrigger>
      <Button className={styles.trigger} aria-label="Menu">
        ☰
      </Button>
      <Popover className={styles.popover}>
        <Dialog className={styles.menu}>
          {({ close }) => (
            <Link to="/saved" className={styles.menuLink} onClick={close}>
              Saved
            </Link>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
