import express, { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "../config/ormconfig";
import { Customers } from "../src/Entities/CustomerEntity";

// const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/customerLogin", async (req: Request, res: Response) => {
    const customerExists = await connectDB.getRepository(Customers).findOne({where: {email: req.body.email}})
    const decryptedPassword = await bcrypt.compare(req.body.password,customerExists?.password)

    // if (customerExists?.email == req.body.email && decryptedPassword) {

    // }
    console.log(decryptedPassword);
    res.send("Verified");

})

export default router;