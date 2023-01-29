"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ormconfig_1 = __importDefault(require("./config/ormconfig"));
// Import CORS
const cors = require("cors");
// Import API routes
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const customerLoginRoutes_1 = __importDefault(require("./authentication/customerLoginRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const adminLoginRoutes_1 = __importDefault(require("./authentication/adminLoginRoutes"));
const deliveryPersonRoutes_1 = __importDefault(require("./routes/deliveryPersonRoutes"));
const deliveryPersonLoginRoutes_1 = __importDefault(require("./authentication/deliveryPersonLoginRoutes"));
const mainServer = () => {
    const app = (0, express_1.default)();
    // Parse JSON
    app.use(express_1.default.json());
    // Use CORS
    app.use(cors());
    // Connect to the database
    ormconfig_1.default;
    // Fetching API from the respective routes
    app.use("/api/customers", customerRoutes_1.default);
    app.use("/api/customers", customerLoginRoutes_1.default);
    app.use("/api/admin", adminRoutes_1.default);
    app.use("/api/admin", adminLoginRoutes_1.default);
    app.use("/api/delivery", deliveryPersonRoutes_1.default);
    app.use("/api/delivery", deliveryPersonLoginRoutes_1.default);
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running worker: ${process.pid} on port: ${port}`);
    });
};
exports.default = mainServer;
