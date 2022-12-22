import express, { Request, Response } from "express"

// Using environment variables
import dotenv from "dotenv";
dotenv.config();

// Import config file
import connectDB from "../config/ormconfig";

// Import Entities
import { DeliveryPerson } from "../src/Entities/DeliveryPerson.Entity";
import { DeliveryPersonTokens } from "../src/Entities/DeliveryPersonTokenList";

// Pre-requisites
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/deliveryLogin", async (req: Request, res: Response) => {
    const checkIfDeliveryPersonExists = await connectDB.getRepository(DeliveryPerson).findOne({
        where: {email: req.body.email}
    })

    const decryptedPassword = await bcrypt.compare(req.body.password, checkIfDeliveryPersonExists?.password || 0);

    console.log(decryptedPassword);

    if (checkIfDeliveryPersonExists?.email == req.body.email && decryptedPassword) {
        const deliveryLoginCredentials = {
            email: req.body.email,
            password: req.body.password,
        }

        const accessToken = jwt.sign(deliveryLoginCredentials, process.env.ACCESS_TOKEN);

        await connectDB.getRepository(DeliveryPersonTokens).insert({
            email: deliveryLoginCredentials?.email,
            token_issued: accessToken
        });

        res.json({
            message: "Login session details successfully stored in database.",
            accessToken: accessToken
        })
    }

    else {
        res.json({
            message: "Login unsucessful. Incorrect credentials provided that do not exist on our system."
        })
    }
})

export default router;