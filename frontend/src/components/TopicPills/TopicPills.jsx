import styles from "./TopicPills.module.css";

const QUICK_TOPICS = [
    {
        label: "Number Line",
        query: "Can you explain how the number line works?",
    },
    { label: "Sets", query: "I want to understand sets." },
    { label: "Adding Fractions", query: "What is 1/2 + 1/3?" },
    { label: "Linear Equations", query: "Solve 2x + 3 = 7. Show me first how it's solved graphically and then give me the solution mathematically." },
];

export default function TopicPills({ onSelect }) {
    return (
        <div className={styles.pills}>
            {QUICK_TOPICS.map(({ label, query }) => (
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
