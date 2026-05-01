import Sidebar from "../Sidebar/Sidebar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar open={open} setOpen={setOpen} />
            <div
                style={{
                    flex: 1,
                    marginLeft: open ? "200px" : "60px",
                    transition: "margin-left 0.22s ease",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Outlet />
            </div>
        </div>
    );
}
