import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import styles from "./Auth.module.css";

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login, signup, user } = useAuth();
    const navigate = useNavigate();

    if (user) return <Navigate to="/new-chat" replace />;

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            navigate("/new-chat");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter") handleSubmit();
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h2 className={styles.brand}>ChatMath</h2>
                <p className={styles.tagline}>
                    {isLogin ? "Welcome back" : "Create your account"}
                </p>

                <input
                    className={styles.input}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKey}
                />
                <input
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKey}
                />

                {error && <p className={styles.error}>{error}</p>}

                <button
                    className={styles.btn}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Please wait..." : isLogin ? "Login" : "Sign up"}
                </button>

                <p className={styles.toggle}>
                    {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}{" "}
                    <span
                        onClick={() => {
                            setIsLogin((p) => !p);
                            setError(null);
                        }}
                    >
                        {isLogin ? "Sign up" : "Login"}
                    </span>
                </p>
            </div>
        </div>
    );
}
