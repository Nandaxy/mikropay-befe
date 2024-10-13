import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Member from "./pages/Member";
import Header from "./components/layout/Header";
import TripaySettings from "./pages/TripaySettings";
import GeneralSettings from "./pages/GeneralSettings";
import RouterSettings from "./pages/RouterSettings";
import { jwtDecode } from "jwt-decode";
import { refreshToken } from "./lib/auth";
import { Toaster } from "@/components/ui/toaster";

const useTokenRefresh = (setAccessToken) => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (refreshTokenValue) {
        try {
          const { data } = await refreshToken({
            token: refreshTokenValue,
          });
          localStorage.setItem("accessToken", data.accessToken);
          setAccessToken(data.accessToken);
        } catch (error) {
          console.error(error);
        }
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [setAccessToken]);
};

const App = () => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  const navigate = useNavigate();

  useTokenRefresh(setAccessToken);

  useEffect(() => {
    const handleTokenRefresh = async () => {
      if (accessToken) {
        const decodedToken = jwtDecode(accessToken);
        if (decodedToken.exp * 1000 < Date.now()) {
          const refreshTokenValue = localStorage.getItem("refreshToken");
          if (refreshTokenValue) {
            try {
              const { data } = await refreshToken({
                token: refreshTokenValue,
              });
              localStorage.setItem("accessToken", data.accessToken);
              setAccessToken(data.accessToken);
            } catch (error) {
              console.error(error);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              navigate("/login"); // Redirect to login if refresh fails
            }
          } else {
            navigate("/login"); // Redirect to login if no refresh token
          }
        }
      }
    };
    handleTokenRefresh();
  }, [accessToken, navigate]);

  const decodedToken = accessToken ? jwtDecode(accessToken) : null;
  const isTokenExpired = decodedToken
    ? decodedToken.exp * 1000 < Date.now()
    : true;

  const role = decodedToken ? decodedToken.role : null;

  return (
    <div className="min-h-screen">
      <Toaster />
      <Header />
      <Routes>
        <Route
          path="/login"
          element={<Login setAccessToken={setAccessToken} />}
        />
        <Route
          path="/dashboard"
          element={
            !accessToken || isTokenExpired ? (
              <Navigate to="/login" />
            ) : role === "admin" ? (
              <Dashboard user={decodedToken} />
            ) : role === "user" ? (
              <Navigate to="/member" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/member"
          element={
            !accessToken || isTokenExpired ? (
              <Navigate to="/login" />
            ) : role === "user" ? (
              <Member />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/setting/tripay"
          element={
            !accessToken || isTokenExpired ? (
              <Navigate to="/login" />
            ) : role === "admin" ? (
              <TripaySettings user={decodedToken} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/setting/general"
          element={
            !accessToken || isTokenExpired ? (
              <Navigate to="/login" />
            ) : role === "admin" ? (
              <GeneralSettings user={decodedToken} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/router"
          element={
            !accessToken || isTokenExpired ? (
              <Navigate to="/login" />
            ) : role === "admin" ? (
              <RouterSettings user={decodedToken} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/service/limit"
          element={
            !accessToken || isTokenExpired ? (
              <Navigate to="/login" />
            ) : role === "admin" ? (
              <RouterSettings user={decodedToken} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

export default App;
