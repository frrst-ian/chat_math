// frontend/src/pages/Recommendations/Recommendations.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getRecommendations, generateRecommendation } from "../../helpers/api";
import styles from "./Recommendations.module.css";

export default function Recommendations() {
    const [recs, setRecs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState({});
    const { token } = useAuth();

    useEffect(() => {
        getRecommendations(token)
            .then(setRecs)
            .finally(() => setLoading(false));
    }, [token]);

    const handleGenerate = async (topic) => {
        setGenerating(prev => ({ ...prev, [topic]: true }));
        await generateRecommendation(topic, token);
        // poll until ready
        const interval = setInterval(async () => {
            const updated = await getRecommendations(token);
            setRecs(updated);
            const rec = updated.find(r => r.topic === topic);
            if (rec?.ready) {
                clearInterval(interval);
                setGenerating(prev => ({ ...prev, [topic]: false }));
            }
        }, 5000);
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    const grouped = recs.reduce((acc, rec) => {
        if (!acc[rec.competency]) acc[rec.competency] = [];
        acc[rec.competency].push(rec);
        return acc;
    }, {});

    if (!Object.keys(grouped).length) {
        return (
            <div className={styles.empty}>
                <p>No recommendations yet.</p>
                <span>Recommendations appear when multiple teachers query the same topic.</span>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h2 className={styles.title}>Recommended Animations</h2>
            <p className={styles.subtitle}>
                Pre-built based on what teachers are asking about most.
            </p>

            {Object.entries(grouped).map(([competency, items]) => (
                <div key={competency} className={styles.group}>
                    <div className={styles.groupHeader}>
                        <span className={styles.competency}>{competency}</span>
                        <span className={styles.badge}>
                            {items[0].teacher_count} teachers querying this
                        </span>
                    </div>

                    <div className={styles.cards}>
                        {items.map(rec => (
                            <div key={rec.topic} className={styles.card}>
                                <p className={styles.topic}>{rec.topic}</p>
                                {rec.ready ? (
                                    <span className={styles.ready}>✓ Ready</span>
                                ) : generating[rec.topic] ? (
                                    <span className={styles.generating}>Rendering...</span>
                                ) : (
                                    <button
                                        className={styles.generateBtn}
                                        onClick={() => handleGenerate(rec.topic)}
                                    >
                                        Pre-build
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}