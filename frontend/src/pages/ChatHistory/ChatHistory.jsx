import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserSessions, deleteSession } from "../../helpers/chatStorage";
import { Trash2 } from "lucide-react";
import styles from "./ChatHistory.module.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ChatHistory() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getUserSessions()
            .then(setSessions)
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        await deleteSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    return (
        <SkeletonTheme baseColor="#1e2128" highlightColor="#2a2d35">
            <div className={styles.page}>
                <h2 className={styles.title}>Chat History</h2>

                {loading ? (
                    <div className={styles.list}>
                        {Array(5).fill(0).map((_, i) => (
                            <div key={i} className={styles.item}>
                                <div className={styles.info}>
                                    <Skeleton width={200} height={14} />
                                    <Skeleton width={120} height={11} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !sessions.length ? (
                    <div className={styles.empty}>
                        <p>No chat history yet.</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                className={styles.item}
                                onClick={() => navigate(`/chat/${session.id}`)}
                            >
                                <div className={styles.info}>
                                    <span className={styles.sessionTitle}>{session.title}</span>
                                    <span className={styles.date}>
                                        {new Date(session.created_at).toLocaleDateString("en-PH", {
                                            month: "short", day: "numeric",
                                            hour: "2-digit", minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => handleDelete(e, session.id)}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SkeletonTheme>
    );
}