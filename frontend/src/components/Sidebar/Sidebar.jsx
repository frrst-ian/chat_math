import {
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    CirclePlus,
    MessagesSquare,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
    { icon: CirclePlus, label: "New chat", href: "/new-chat" },
    { icon: MessagesSquare, label: "Chats", href: "/chats" },
];

export default function Sidebar({ open, setOpen }) {
    const { pathname } = useLocation();
    // const { user, logout } = useAuth();
    // const navigate = useNavigate();

    // const handleLogout = () => {
    //     logout();
    //     navigate("/");
    // };

    return (
        <nav className={`${styles.sidebar} ${open ? styles.expanded : ""}`}>
            <div className={styles.header}>
                <Link to="/" className={styles.logo}>
                    Chat Math
                </Link>
                <button
                    className={styles.toggleBtn}
                    onClick={() => setOpen((o) => !o)}
                    aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {open ? (
                        <PanelLeftClose size={18} strokeWidth={1.75} />
                    ) : (
                        <PanelLeftOpen size={18} strokeWidth={1.75} />
                    )}
                </button>
            </div>

            {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
                <Link
                    key={label}
                    to={href}
                    className={`${styles.navItem} ${pathname === href ? styles.active : ""}`}
                    data-label={label}
                    aria-label={label}
                >
                    <Icon
                        size={20}
                        strokeWidth={1.75}
                        className={styles.icon}
                    />
                    <span className={styles.label}>{label}</span>
                </Link>
            ))}

            <Link
                to="/settings"
                className={`${styles.navItem} ${pathname === "/settings" ? styles.active : ""} ${styles.bottom} `}
                data-label="Settings"
                aria-label="Settings"
            >
                <Settings
                    size={20}
                    strokeWidth={1.75}
                    className={styles.icon}
                />
                <span className={styles.label}>Settings</span>
            </Link>
        </nav>
    );
}