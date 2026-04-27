import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import "./styles/app.css";

const App = () => {
    return (
        <BrowserRouter>
            <div className="app">
                <div className="main">

                    <AppRoutes />
                </div>
            </div>
        </BrowserRouter>
    );
};

export default App;