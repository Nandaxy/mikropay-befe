import React from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Sidebar from "./admin/sidebar.jsx";
import { Button } from "@/components/ui/button";

const Dashboard = ({ user }) => {
    

    console.log(user);

    return (
        <div>
            <Sidebar user={user}>
                <h1>yes</h1>
            </Sidebar>
        </div>
    );
};

export default Dashboard;
