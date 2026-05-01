import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    useContext,
} from "react";
import { supabase } from "../helpers/supabase";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const userRef = useRef(user);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // restore session on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user);
                setToken(session.access_token);
            }
            setLoading(false);
        });

        // listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session) {
                    setUser(session.user);
                    setToken(session.access_token);
                } else {
                    setUser(null);
                    setToken(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        setUser(data.user);
        setToken(data.session.access_token);
    }, []);

    const signup = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data;
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setToken(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, token, login, signup, logout, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
export { AuthProvider };