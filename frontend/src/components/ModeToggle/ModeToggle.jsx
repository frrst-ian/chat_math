import { Video, MessageCircle } from "lucide-react";
import styles from "./ModeToggle.module.css";

export default function ModeToggle({ mode, setMode }) {
    return (
        <div className={styles.bar}>
            <div className={styles.toggles}>
                <button
                    className={`${styles.btn} ${mode === "video" ? styles.active : ""}`}
                    onClick={() => setMode("video")}
                    aria-label="Video mode"
                >
                    <Video size={18} strokeWidth={1.75} />
                </button>
                <button
                    className={`${styles.btn} ${mode === "chat" ? styles.active : ""}`}
                    onClick={() => setMode("chat")}
                    aria-label="Chat mode"
                >
                    <MessageCircle size={18} strokeWidth={1.75} />
                </button>
            </div>
            <span className={styles.label}>
                {mode === "video" ? "Video Mode" : "Chat Mode"}
            </span>
        </div>
    );
}