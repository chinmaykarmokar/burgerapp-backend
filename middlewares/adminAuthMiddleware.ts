import { AdminTokens } from "../src/Entities/AdminTokenList";
import connectDB from "../config/ormconfig";

const jwt = require("jsonwebtoken");

// Using environment variables
import dotenv from "dotenv";
dotenv.config();

const authenticateAdminToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const tokenInUse = authHeader?.split(" ")[1];

    const findAdmin = await connectDB.getRepository(AdminTokens).findOne({ 
        where: {token_issued: tokenInUse},
        order: {id: "DESC"} 
    })

    const latestTokenCreatedByAdmin = await connectDB.getRepository(AdminTokens).findOne({ 
        where: {email: findAdmin?.email}, 
        order: {id: "DESC"}
    })

    // console.log("latestToken", latestTokenCreatedByAdmin?.unique_id);

    const tokenValidTime = Math.abs(new Date().getTime() - findAdmin!.token_created_on.getTime())/60000;
    console.log(tokenValidTime);

    if (tokenInUse === null || tokenInUse == undefined) {
        return res.status(403);
    }

    if (findAdmin?.token_issued != latestTokenCreatedByAdmin?.token_issued || tokenValidTime >= 1000) {
        return res.status(401).json({
            message: "Session experied. Please login to continue."
        })
    }

    jwt.verify(tokenInUse, process.env.ACCESS_TOKEN, async (err: any, user: any) => {
        if (err) {
            return res.status(403);
        }
        else {
            res.user = user;
            next();
        } 
    })
}

export default authenticateAdminToken;