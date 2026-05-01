import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Settings.module.css";

export default function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/auth");
    };

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Settings</h2>

            <div className={styles.section}>
                <p className={styles.label}>Logged in as</p>
                <p className={styles.value}>{user?.email}</p>
            </div>

            <button className={styles.logoutBtn} onClick={handleLogout}>
                Log out
            </button>
        </div>
    );
}