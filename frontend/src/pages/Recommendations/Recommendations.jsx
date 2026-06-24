import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getRecommendations,
    generateRecommendation,
    getInsights,
} from "../../helpers/api";
import styles from "./Recommendations.module.css";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate } from "react-router-dom";

export default function Recommendations() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState("recommendations");
    const [recs, setRecs] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState({});

    useEffect(() => {
        Promise.all([getRecommendations(token), getInsights(token)])
            .then(([recsData, insightsData]) => {
                setRecs(recsData);
                setInsights(insightsData);
            })
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

    const handleWatch = async (topic) => {
        navigate(`/new-chat`, { state: { prefill: topic } });
    };

    const groupedRecs = recs.reduce((acc, rec) => {
        if (!acc[rec.competency]) acc[rec.competency] = [];
        acc[rec.competency].push(rec);
        return acc;
    }, {});

    return (
        <SkeletonTheme baseColor="#1e2128" highlightColor="#2a2d35">
            <div className={styles.page}>
                <h2 className={styles.title}>Recommendations</h2>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${tab === "recommendations" ? styles.tabActive : ""}`}
                        onClick={() => setTab("recommendations")}
                    >
                        Animations
                    </button>
                    <button
                        className={`${styles.tab} ${tab === "insights" ? styles.tabActive : ""}`}
                        onClick={() => setTab("insights")}
                    >
                        Insights
                    </button>
                </div>

                {tab === "recommendations" ? (
                    <>
                        <p className={styles.subtitle}>
                            Pre-built based on what teachers are asking about
                            most.
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
                                            <div
                                                key={i}
                                                className={styles.card}
                                            >
                                                <Skeleton
                                                    height={14}
                                                    width="80%"
                                                />
                                                <Skeleton
                                                    height={28}
                                                    width={80}
                                                    borderRadius={6}
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ) : !Object.keys(groupedRecs).length ? (
                            <div className={styles.empty}>
                                <p>No recommendations yet.</p>
                                <span>
                                    Recommendations appear when teachers query
                                    the same topic.
                                </span>
                            </div>
                        ) : (
                            Object.entries(groupedRecs).map(
                                ([competency, items]) => (
                                    <div
                                        key={competency}
                                        className={styles.group}
                                    >
                                        <div className={styles.groupHeader}>
                                            <span className={styles.competency}>
                                                {competency}
                                            </span>
                                            <span className={styles.badge}>
                                                {items[0].teacher_count}{" "}
                                                teachers querying this
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
                                                        <div
                                                            className={
                                                                styles.readyRow
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    styles.ready
                                                                }
                                                            >
                                                                ✓ Ready
                                                            </span>
                                                            <button
                                                                className={
                                                                    styles.watchBtn
                                                                }
                                                                onClick={() =>
                                                                    handleWatch(
                                                                        rec.topic,
                                                                    )
                                                                }
                                                            >
                                                                Open in Chat
                                                            </button>
                                                        </div>
                                                    ) : generating[
                                                          rec.topic
                                                      ] ? (
                                                        <span
                                                            className={
                                                                styles.generating
                                                            }
                                                        >
                                                            Rendering...
                                                        </span>
                                                    ) : (
                                                        <button
                                                            className={
                                                                styles.generateBtn
                                                            }
                                                            onClick={() =>
                                                                handleGenerate(
                                                                    rec.topic,
                                                                )
                                                            }
                                                        >
                                                            Pre-build
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )
                        )}
                    </>
                ) : (
                    <>
                        <p className={styles.subtitle}>
                            Which topics teachers are querying most.
                        </p>

                        {loading ? (
                            <div className={styles.insightsList}>
                                {Array(4)
                                    .fill(0)
                                    .map((_, i) => (
                                        <div
                                            key={i}
                                            className={styles.insightRow}
                                        >
                                            <Skeleton width={160} height={14} />
                                            <Skeleton
                                                width={60}
                                                height={22}
                                                borderRadius={999}
                                            />
                                        </div>
                                    ))}
                            </div>
                        ) : !insights.length ? (
                            <div className={styles.empty}>
                                <p>No data yet.</p>
                                <span>
                                    Insights appear as teachers use ChatMath.
                                </span>
                            </div>
                        ) : (
                            <div className={styles.insightsList}>
                                {insights
                                    .sort((a, b) => b.user_count - a.user_count)
                                    .map((item) => (
                                        <div
                                            key={item.competency}
                                            className={styles.insightRow}
                                        >
                                            <span
                                                className={styles.insightLabel}
                                            >
                                                {item.competency}
                                            </span>
                                            <span
                                                className={styles.insightCount}
                                            >
                                                {item.user_count}{" "}
                                                {item.user_count === 1
                                                    ? "teacher"
                                                    : "teachers"}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </SkeletonTheme>
    );
}
