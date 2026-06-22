import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import { AuthProvider } from "./context/AuthContext";
import "./styles/App.css";
import { Toaster } from "react-hot-toast";

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="app">
                    <div className="main">
                        <AppRoutes />
                    </div>
                </div>
                <Toaster position="bottom-center" />
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
