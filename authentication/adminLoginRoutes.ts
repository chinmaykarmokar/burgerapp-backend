import express, { Request, Response } from "express";
import connectDB from "../config/ormconfig";
import { Admin } from "../src/Entities/AdminEntity";
import { AdminTokens } from "../src/Entities/AdminTokenList";

// Using environment variables
import dotenv from "dotenv"
dotenv.config()

const jwt = require("jsonwebtoken");

// Decrypting password
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/adminLogin", async (req: Request, res: Response) => {
    const adminExists = await connectDB.getRepository(Admin).find({ 
        where: {email: req.body.email} 
    })

    console.log(adminExists);

    const decryptedPassword = await bcrypt.compare(req.body.password, adminExists[0]?.password || " ");

    if (adminExists[0]?.email == req.body.email && decryptedPassword) {
        const adminLoginDetails = {
            email: req.body.email,
            password: req.body.password,
        }

        const accessToken = jwt.sign(adminLoginDetails, process.env.ACCESS_TOKEN);

        await connectDB.getRepository(AdminTokens).insert({
            email: adminLoginDetails?.email,
            token_issued: accessToken
        })

        res.json({
            message: "Login details stored in database",
            accessToken: accessToken
        })
    }

    else {
        res.json({
            error: `User with the email ${req.body.email} does not exist on our system.`
        })
    }
})

export default router;