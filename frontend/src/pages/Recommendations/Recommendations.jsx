import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getRecommendations, generateRecommendation } from "../../helpers/api";
import styles from "./Recommendations.module.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
        setGenerating((prev) => ({ ...prev, [topic]: true }));
        await generateRecommendation(topic, token);
        const interval = setInterval(async () => {
            const updated = await getRecommendations(token);
            setRecs(updated);
            const rec = updated.find((r) => r.topic === topic);
            if (rec?.ready) {
                clearInterval(interval);
                setGenerating((prev) => ({ ...prev, [topic]: false }));
            }
        }, 5000);
    };

    return (
        <SkeletonTheme baseColor="#1e2128" highlightColor="#2a2d35">
            <div className={styles.page}>
                <h2 className={styles.title}>Recommended Animations</h2>
                <p className={styles.subtitle}>
                    Pre-built based on what teachers are asking about most.
                </p>

                {loading ? (
                    <div className={styles.group}>
                        <div className={styles.groupHeader}>
                            <Skeleton width={160} height={16} />
                            <Skeleton
                                width={120}
                                height={22}
                                borderRadius={999}
                            />
                        </div>
                        <div className={styles.cards}>
                            {Array(3)
                                .fill(0)
                                .map((_, i) => (
                                    <div key={i} className={styles.card}>
                                        <Skeleton height={14} width="80%" />
                                        <Skeleton
                                            height={28}
                                            width={80}
                                            borderRadius={6}
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                ) : !Object.keys(
                      recs.reduce((acc, rec) => {
                          if (!acc[rec.competency]) acc[rec.competency] = [];
                          acc[rec.competency].push(rec);
                          return acc;
                      }, {}),
                  ).length ? (
                    <div className={styles.empty}>
                        <p>No recommendations yet.</p>
                        <span>
                            Recommendations appear when teachers query the same
                            topic.
                        </span>
                    </div>
                ) : (
                    Object.entries(
                        recs.reduce((acc, rec) => {
                            if (!acc[rec.competency]) acc[rec.competency] = [];
                            acc[rec.competency].push(rec);
                            return acc;
                        }, {}),
                    ).map(([competency, items]) => (
                        <div key={competency} className={styles.group}>
                            <div className={styles.groupHeader}>
                                <span className={styles.competency}>
                                    {competency}
                                </span>
                                <span className={styles.badge}>
                                    {items[0].teacher_count} teachers querying
                                    this
                                </span>
                            </div>
                            <div className={styles.cards}>
                                {items.map((rec) => (
                                    <div
                                        key={rec.topic}
                                        className={styles.card}
                                    >
                                        <p className={styles.topic}>
                                            {rec.topic}
                                        </p>
                                        {rec.ready ? (
                                            <span className={styles.ready}>
                                                ✓ Ready
                                            </span>
                                        ) : generating[rec.topic] ? (
                                            <span className={styles.generating}>
                                                Rendering...
                                            </span>
                                        ) : (
                                            <button
                                                className={styles.generateBtn}
                                                onClick={() =>
                                                    handleGenerate(rec.topic)
                                                }
                                            >
                                                Pre-build
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </SkeletonTheme>
    );
}
