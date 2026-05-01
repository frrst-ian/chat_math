import { Play } from "lucide-react";
import styles from "./VideoPlayer.module.css";

const LOADING_MESSAGES = [
    "Reading your question...",
    "Writing the animation script...",
    "Rendering your video...",
    "Almost done...",
];

export default function VideoPlayer({ videoUrl, status }) {
    const isLoading = status === "pending" || status === "rendering";
    const msgIndex = status === "pending" ? 0 : status === "rendering" ? 2 : 3;

    if (!videoUrl && !isLoading) {
        return (
            <div className={styles.empty}>
                <Play size={36} strokeWidth={1.5} className={styles.playIcon} />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.empty}>
                <div className={styles.spinner} />
                <p className={styles.loadingMsg}>{LOADING_MESSAGES[msgIndex]}</p>
            </div>
        );
    }

    return (
        <div className={styles.playerWrap}>
            <video
                className={styles.video}
                src={videoUrl}
                controls
                autoPlay
            />
        </div>
    );
}