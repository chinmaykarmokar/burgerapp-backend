import express, { Request, Response } from "express";
import connectDB from "../config/ormconfig";

// Import CORS
const cors = require("cors");

// Import API routes
import customerRoutes from "./routes/customerRoutes";
import customerLoginRoutes from "../authentication/customerLoginRoutes";
import adminRoutes from "./routes/adminRoutes";
import adminLoginRoutes from "../authentication/adminLoginRoutes";
import deliveryRoutes from "./routes/deliveryPersonRoutes";
import deliveryLoginRoutes from "../authentication/deliveryPersonLoginRoutes";

const mainServer = () => {
    const app = express();

    // Parse JSON
    app.use(express.json());

    // Use CORS
    app.use(cors());

    // Connect to the database
    connectDB;

    // Fetching API from the respective routes
    app.use("/api/customers", customerRoutes);
    app.use("/api/customers", customerLoginRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/admin", adminLoginRoutes);
    app.use("/api/delivery", deliveryRoutes);
    app.use("/api/delivery", deliveryLoginRoutes);

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Server is running worker: ${process.pid} on port: ${port}`);
    })
}

export default mainServer;