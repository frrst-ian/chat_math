import { Routes, Route, Navigate } from "react-router-dom";
import NewChat from "./pages/NewChat/NewChat";
import Layout from "./components/Layout/Layout";
// import NotFound from "./components/NotFound/NotFound";

const AppRoutes = () => {
    return (
        <Routes>
            {/*<Route path="*" element={<NotFound />} />*/}
            <Route path="/" element={<Navigate to="new-chat" replace />} />
            <Route element={<Layout />}>
                <Route path="new-chat" element={<NewChat />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
