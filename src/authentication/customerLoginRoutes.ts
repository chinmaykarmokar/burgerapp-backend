import express, { Request, Response } from "express";

// Using state variables
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/ormconfig";

// Import Entities
import { Customers } from "../Entities/CustomerEntity";
import { CustomerTokens } from "../Entities/CustomerTokenList";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const router = express.Router();

const uniqueID = crypto.randomBytes(16).toString("hex");

router.post("/customerLogin", async (req: Request, res: Response) => {
    const customerExists = await connectDB.getRepository(Customers).findOne({where: {email: req.body.email}})
    const decryptedPassword = await bcrypt.compare(req.body.password,customerExists?.password || " ")

    console.log(decryptedPassword);

    if (customerExists?.email == req.body.email && decryptedPassword) {
        const customerLoginDetails = {
            email: req.body.email,
            password: req.body.password,
            unique_id: uniqueID
        }

        const accessToken = jwt.sign(customerLoginDetails, process.env.ACCESS_TOKEN);

        await connectDB.getRepository(CustomerTokens).insert({
            email: customerLoginDetails?.email,
            unique_id: customerLoginDetails?.unique_id,
            token_issued: accessToken
        })

        res.json({
            message: "Login details stored in database.",
            accessToken: accessToken
        })
    }
    else {
        res.json({
            error: `User with the email id ${req.body.email} does not exist on our system.`
        })
    }
})

export default router;