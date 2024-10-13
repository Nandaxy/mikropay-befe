const mongoose = require("mongoose");

const routerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ip: { type: String, required: true },
    port: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String },
    dnsMikrotik: { type: String },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Router", routerSchema);
