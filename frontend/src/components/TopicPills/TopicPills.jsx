import { useState, useEffect } from "react";
import { getTopics } from "../../helpers/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./TopicPills.module.css";

export default function TopicPills({ onSelect }) {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        getTopics(token)
            .then((data) => setTopics(Object.entries(data)))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className={styles.pills}>
                {Array(4)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className={styles.pillSkeleton} />
                    ))}
            </div>
        );
    }

    return (
        <div className={styles.pills}>
            {topics.map(([label, query]) => (
                <button
                    key={label}
                    className={styles.pill}
                    onClick={() => onSelect(query)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
