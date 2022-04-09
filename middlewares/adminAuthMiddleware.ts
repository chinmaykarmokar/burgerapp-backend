import { AdminTokens } from "../src/Entities/AdminTokenList";
import connectDB from "../config/ormconfig";

const jwt = require("jsonwebtoken");

// Using environment variables
import dotenv from "dotenv";
dotenv.config();

const authenticateAdminToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const tokenInUse = authHeader?.split(" ")[1];

    const findAdmin = await connectDB.getRepository(AdminTokens).find({ 
        where: {token_issued: tokenInUse},
        order: {id: "DESC"} 
    })

    console.log("tokenInUSe", findAdmin[0]?.unique_id);

    const latestTokenCreatedByAdmin = await connectDB.getRepository(AdminTokens).find({ 
        where: {email: findAdmin[0]?.email}, 
        order: {id: "DESC"},
        take: 1
    })

    console.log("latestToken", latestTokenCreatedByAdmin[0]?.unique_id);

    const tokenValidTime = Math.abs(new Date().valueOf() - findAdmin[0]?.token_created_on.valueOf())/60000;
    console.log(tokenValidTime);

    if (tokenInUse === null || tokenInUse == undefined) {
        res.status(403);
    }

    if (findAdmin[0]?.unique_id != latestTokenCreatedByAdmin[0]?.unique_id || tokenValidTime >= 5) {
        res.status(401).json({
            message: "This token has been invalidated. Your session has experied. Please login again to continue."
        })
    }

    jwt.verify(tokenInUse, process.env.ACCESS_TOKEN, async (err: any, user: any) => {
        if (err) {
            res.status(403);
        }
        else {
            res.user = user;
            next();
        } 
    })
}

export default authenticateAdminToken;