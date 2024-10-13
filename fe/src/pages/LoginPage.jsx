import React from "react";
import Login from "../components/Login";

const LoginPage = ({ setAccessToken }) => {
    return (
        <div>
            <h1>Login Page</h1>
            <Login setAccessToken={setAccessToken} />
        </div>
    );
};

export default LoginPage;
