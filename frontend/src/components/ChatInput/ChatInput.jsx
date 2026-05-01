import { useState } from "react";
import { ArrowUp } from "lucide-react";
import styles from "./ChatInput.module.css";

export default function ChatInput({ onSubmit, disabled }) {
    const [value, setValue] = useState("");

    const handleSubmit = () => {
        if (!value.trim() || disabled) return;
        onSubmit(value.trim());
        setValue("");
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={styles.wrap}>
            <input
                className={styles.input}
                placeholder="How can I help you today?"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKey}
                disabled={disabled}
            />
            <button
                className={styles.sendBtn}
                onClick={handleSubmit}
                disabled={disabled || !value.trim()}
                aria-label="Send"
            >
                <ArrowUp size={18} strokeWidth={2} />
            </button>
        </div>
    );
}