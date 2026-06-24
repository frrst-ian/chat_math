import { Link } from "react-router-dom";
import styles from "./NotFound.css";

export default function NotFound() {
    return (
        <div className={styles.page}>
            <h2 className={styles.code}>404</h2>
            <p className={styles.message}>Page not found</p>
            <Link to="/new-chat" className={styles.link}>Go home</Link>
        </div>
    );
}