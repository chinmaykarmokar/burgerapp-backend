import { CustomerTokens } from "../src/Entities/CustomerTokenList";
import connectDB from "../config/ormconfig";

const jwt = require("jsonwebtoken");

const authenticateCustomerToken = async (req:any, res:any, next:any) => {
    const authHeader = req.headers["authorization"];
    const tokenInUse = authHeader?.split(" ")[1];

    const findCustomer = await connectDB.getRepository(CustomerTokens).find({ 
        where: {token_issued: tokenInUse},
        order: {id: "DESC"} 
    })

    console.log("tokenInUse", findCustomer[0]?.unique_id);

    const latestTokenCreatedByCustomer = await connectDB.getRepository(CustomerTokens).find({ 
        where: {email: findCustomer[0]?.email},
        order: {id: "DESC"},
        take: 1 
    })

    console.log("latestToken", latestTokenCreatedByCustomer[0]?.unique_id);

    const tokenValidTime = Math.abs(new Date().valueOf() - findCustomer[0].token_created_on.valueOf())/60000;
    console.log(tokenValidTime);

    if (tokenInUse === null || tokenInUse == undefined) {
        return res.status(403);
    }

    if (findCustomer[0]?.unique_id != latestTokenCreatedByCustomer[0]?.unique_id || tokenValidTime >= 5) {
        return res.status(401).json({
            message: "This token has been invalidated. Your session has experied. Please login again to continue."
        })
    }
    
    jwt.verify(tokenInUse, process.env.ACCESS_TOKEN, async (err:any, user:any) => {
        if (err) {
            res.status(403);
        }
        else {
            req.user = user;
            next();
        }
    })
}

export default authenticateCustomerToken;