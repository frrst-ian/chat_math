import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import { AuthProvider } from "./context/AuthContext";
import "./styles/App.css";

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="app">
                    <div className="main">
                        <AppRoutes />
                    </div>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
