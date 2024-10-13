const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const {
    authenticateToken,
    authorizeAdmin,
    authorizeUser
} = require("../middleware/auth");

const createResponse = (status, message, path, type, data = {}) => ({
    status,
    message,
    path,
    type,
    ...data
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const path = "/login";

    if (
        !username ||
        typeof username !== "string" ||
        username.length < 3 ||
        username.length > 20
    ) {
        return res
            .status(400)
            .json(
                createResponse(
                    400,
                    "Invalid username",
                    path,
                    "validation_error"
                )
            );
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res
                .status(401)
                .json(
                    createResponse(
                        401,
                        "Invalid credentials",
                        path,
                        "unauthorized"
                    )
                );
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log("Password does not match");
            return res
                .status(401)
                .json(
                    createResponse(
                        401,
                        "Invalid credentials",
                        path,
                        "unauthorized"
                    )
                );
        }

        const accessToken = jwt.sign(
            { userId: user._id, username: user.username, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );
        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        res.json(
            createResponse(200, "Login successful", path, "success", {
                accessToken,
                refreshToken
            })
        );
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json(
            createResponse(500, "Server error", path, "error")
        );
    }
});

router.post("/token", (req, res) => {
    const { token } = req.body;
    const path = "/token";

    console.log("token refresh", token);

    if (!token)
        return res
            .status(401)
            .json(
                createResponse(401, "No token provided", path, "unauthorized")
            );

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
            return res
                .status(403)
                .json(createResponse(403, "Invalid token", path, "forbidden"));

        const accessToken = jwt.sign(
            { userId: user.userId, username: user.username, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );
        console.log("accessToken", accessToken);

        res.json(
            createResponse(200, "Token refreshed", path, "success", {
                accessToken
            })
        );
    });
});

router.post("/verify-token", (req, res) => {
    const { token } = req.body;
    const path = "/verify-token";

    if (!token) {
        return res
            .status(401)
            .json(
                createResponse(401, "No token provided", path, "unauthorized")
            );
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return res
                    .status(401)
                    .json(
                        createResponse(
                            401,
                            "Access token expired",
                            path,
                            "token_expired"
                        )
                    );
            }
            return res
                .status(403)
                .json(
                    createResponse(403, "Invalid token", path, "forbidden")
                );
        }

        res.json(
            createResponse(200, "Token is valid", path, "success", { user })
        );
    });
});



module.exports = router;
