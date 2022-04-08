import express, { Request, Response } from "express";
import { Admin } from "../Entities/AdminEntity";
import connectDB from "../../config/ormconfig";

// Using environment variables
import dotenv from "dotenv";
dotenv.config();

// Encrypt password
const bcrypt = require("bcrypt");

const app = express();

const salt = 10;

// Parse JSON
app.use(express.json());

const router = express.Router();

router.post("/adminRegister", async (req: Request,res: Response) => {
    try {
        const adminDetails = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            mobile: req.body.mobile,
            password: await bcrypt.hash(req.body.password,salt)
        }
        
        await connectDB.getRepository(Admin).insert(adminDetails);

        res.json({
            message: "Admin has been successfully registered."
        })
    }
    catch (error) {
        throw error;
    }
})

router.get("/adminDetails", async (req: Request, res: Response) => {
    const data = await connectDB.getRepository(Admin).find();

    res.json({
        data: data,
        worker_process: process.pid
    })
})

export default router;