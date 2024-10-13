const express = require("express");
const User = require("../models/User");
const Router = require("../models/Router");
const PaymentGateway = require("../models/paymentGateway");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");
const router = express.Router();
const axios = require("axios");

router.post(
  "/admin/users/add",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const {
      username,
      password,
      role,
      pppoeUsername,
      pppoePassword,
      telp,
      email,
    } = req.body;

    const path = "/admin/users/add";

    // Validate input
    if (
      !username ||
      !password ||
      !role ||
      (role !== "admin" && role !== "user")
    ) {
      return res.status(400).json({
        status: 400,
        message: "Invalid input parameters",
        path,
        type: "validation_error",
      });
    }

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          message: "Username already exists",
          path,
          type: "validation_error",
        });
      }

      const newUser = new User({
        username,
        password,
        role,
        pppoeUsername,
        pppoePassword,
        telp,
        email,
      });

      await newUser.save();

      res.status(201).json({
        status: 201,
        message: "User added successfully",
        path,
        type: "success",
        data: {
          userId: newUser._id,
          username: newUser.username,
          role: newUser.role,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({
        status: 500,
        message: "Server error",
        path,
        type: "error",
      });
    }
  }
);

router.get(
  "/admin/users/list",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const path = "/admin/users/list";

    try {
      const users = await User.find().select("-password"); // Exclude the password field
      res.json({
        status: 200,
        message: "Users retrieved successfully",
        path,
        type: "success",
        data: users,
      });
    } catch (error) {
      console.error("Error retrieving users:", error);
      res.status(500).json({
        status: 500,
        message: "Server error",
        path,
        type: "error",
      });
    }
  }
);

router.post(
  "/admin/users/edit",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const {
      userId,
      username,
      password,
      role,
      pppoeUsername,
      pppoePassword,
      telp,
      email,
    } = req.body;
    const path = "/admin/users/edit";

    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: "User ID is required",
        path,
        type: "validation_error",
      });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
          path,
          type: "not_found",
        });
      }

      // Update fields
      if (username) user.username = username;
      if (password) user.password = password; // Will be hashed in pre-save hook
      if (role) user.role = role;
      if (pppoeUsername) user.pppoeUsername = pppoeUsername;
      if (pppoePassword) user.pppoePassword = pppoePassword;
      if (telp) user.telp = telp;
      if (email) user.email = email;

      await user.save();

      res.json({
        status: 200,
        message: "User updated successfully",
        path,
        type: "success",
        data: {
          userId: user._id,
          username: user.username,
          role: user.role,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        status: 500,
        message: "Server error",
        path,
        type: "error",
      });
    }
  }
);

router.post(
  "/admin/users/delete",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { userId } = req.body;
    const path = "/admin/users/delete";

    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: "User ID is required",
        path,
        type: "validation_error",
      });
    }

    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
          path,
          type: "not_found",
        });
      }

      res.json({
        status: 200,
        message: "User deleted successfully",
        path,
        type: "success",
        data: {
          userId: user._id,
        },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        status: 500,
        message: "Server error",
        path,
        type: "error",
      });
    }
  }
);

router.get(
  "/admin/routes/list",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const routers = await Router.find().sort({ createdAt: -1 });
      res.json({
        status: 200,
        message: "Routers retrieved successfully",
        data: routers,
      });
    } catch (error) {
      console.error("Error retrieving routers:", error);
      res.status(500).json({
        status: 500,
        message: "Server error",
      });
    }
  }
);

router.post(
  "/admin/routes/add",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { name, ip, port, username, password, dnsMikrotik } = req.body;
    if (!name || !ip || !port || !username) {
      return res.status(400).json({
        status: 400,
        message: "Name, IP, Port, and Username are required",
      });
    }

    try {
      // Check if a router with the same name already exists
      const existingRouter = await Router.findOne({ name });
      if (existingRouter) {
        return res.status(400).json({
          status: 400,
          message: "Router with this name already exists",
        });
      }

      // Create and save new router
      const newRouter = new Router({
        name,
        ip,
        port,
        username,
        password,
        dnsMikrotik,
      });
      await newRouter.save();
      res.json({
        status: 200,
        message: "Router added successfully",
        data: newRouter,
      });
    } catch (error) {
      console.error("Error adding router:", error);
      res.status(500).json({
        status: 500,
        message: "Server error",
      });
    }
  }
);

router.post(
  "/admin/routes/edit",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { routerId, name, ip, port, username, password, dnsMikrotik } =
      req.body;

    if (!routerId) {
      return res.json({
        status: 400,
        message: "Router ID is required",
      });
    }

    try {
      const router = await Router.findById(routerId);
      if (!router) {
        return res.json({
          status: 404,
          message: "Router not found",
        });
      }

      if (name) {
        const existingRouter = await Router.findOne({
          name,
          _id: { $ne: routerId },
        });
        if (existingRouter) {
          return res.json({
            status: 400,
            message: "Router with this name already exists",
          });
        }
      }

      // Update fields
      if (name) router.name = name;
      if (ip) router.ip = ip;
      if (port) router.port = port;
      if (username) router.username = username;
      if (password) router.password = password;
      if (dnsMikrotik) router.dnsMikrotik = dnsMikrotik;

      await router.save();
      res.json({
        status: 200,
        message: "Router updated successfully",
        data: router,
      });
    } catch (error) {
      console.error("Error updating router:", error);
      res.json({
        status: 500,
        message: "Server error",
      });
    }
  }
);

router.post(
  "/admin/routes/delete",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { routerId } = req.body;

    if (!routerId) {
      return res.status(400).json({
        status: 400,
        message: "Router ID is required",
      });
    }

    try {
      const router = await Router.findByIdAndDelete(routerId);
      if (!router) {
        return res.status(404).json({
          status: 404,
          message: "Router not found",
        });
      }

      res.json({
        status: 200,
        message: "Router deleted successfully",
        data: routerId,
      });
    } catch (error) {
      console.error("Error deleting router:", error);
      res.status(500).json({
        status: 500,
        message: "Server error",
      });
    }
  }
);

router.get(
  "/admin/payment-gateway/tripay",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const paymentGateway = await PaymentGateway.findOne({ code: "tripay" });
      if (!paymentGateway) {
        return res.status(404).json({
          status: 404,
          message: "Payment gateway not found",
        });
      }

      res.json({
        status: 200,
        message: "Payment gateway retrieved successfully",
        data: paymentGateway,
      });
    } catch (error) {
      console.error("Error retrieving payment gateway:", error);
    }
  }
);

router.post(
  "/admin/payment-gateway/tripay/edit",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { apiKey, privateKey, merchantCode, endpoint } = req.body;

    if (!apiKey || !privateKey || !merchantCode || !endpoint) {
      return res.json({
        status: 400,
        message: "All fields are required",
      });
    }

    try {
      const paymentGateway = await PaymentGateway.findOne({ code: "tripay" });
      if (!paymentGateway) {
        return res.json({
          status: 404,
          message: "Payment gateway not found",
        });
      }

      paymentGateway.apiKey = apiKey;
      paymentGateway.privateKey = privateKey;
      paymentGateway.merchantCode = merchantCode;
      paymentGateway.endpoint = endpoint;

      await paymentGateway.save();

      res.json({
        status: 200,
        message: "Payment gateway updated successfully",
        data: paymentGateway,
      });
    } catch (error) {
      console.error("Error updating payment gateway:", error);
    }
  }
);

router.post(
  "/mikrotik/action",

  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    const { routerData, method, endpoint } = req.body;

    if (!routerData || !method) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const url = `http://${routerData.ip}:${routerData.port}/rest/${endpoint}`;

    try {
      const response = await axios({
        method,
        url,
        auth: {
          username: routerData.username,
          password: routerData.password,
        },
        timeout: 5000,
      });

      res.json(response.data);
    } catch (error) {
      console.error("Error during MikroTik API request:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch data from MikroTik", error });
    }
  }
);

module.exports = router;
