import styles from "./ChatBubble.module.css";

export default function ChatBubble({ role, content }) {
    return (
        <div className={`${styles.wrap} ${styles[role]}`}>
            <div className={styles.bubble}>{content}</div>
        </div>
    );
}