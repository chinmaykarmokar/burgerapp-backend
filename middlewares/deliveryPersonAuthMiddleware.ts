// Import orm config
import connectDB from "../config/ormconfig";

// Import Entity
import { DeliveryPersonTokens } from "../src/Entities/DeliveryPersonTokenList";

// Import JWT
const jwt = require("jsonwebtoken");

const authenticateDeliveryPersonToken = async (req:any, res:any, next:any) => {
    const authHeader = req.headers["authorization"];
    const tokenInUse = authHeader?.split(" ")[1];
    
    const currentDeliveryPersonToken = await connectDB.getRepository(DeliveryPersonTokens).findOne({
        where: {token_issued: tokenInUse},
        order: {id: "DESC"}
    })

    console.log("tokenInUse", currentDeliveryPersonToken?.id);

    const findLatestTokenCreated = await connectDB.getRepository(DeliveryPersonTokens).findOne({
        where: {email: currentDeliveryPersonToken?.email},
        order: {id: "DESC"}
    })

    const timeOfTokenInUse = currentDeliveryPersonToken!.token_issue_date.getTime();
    const currentTime = new Date().getTime();

    const tokenValidTime = (Math.round(currentTime - timeOfTokenInUse)/(1000*60)).toFixed(2);

    if (tokenInUse == null || tokenInUse == undefined) {
        return res.status(401).json({
            message: "You are not authorized."
        })
    }

    if (currentDeliveryPersonToken?.token_issued !== findLatestTokenCreated?.token_issued || parseInt(tokenValidTime) >= 20) {
        return res.status(401).send({
            message: "Session expired. Please login to continue."
        })
    }

    jwt.verify(tokenInUse, process.env.ACCESS_TOKEN, async (err: any, user: any) => {
        if (err) {
            return res.status(403);
        }
        else {
            req.user = user;
            next()
        }
    })

    console.log(`Token is valid for ${tokenValidTime} minutes.`);
}

export default authenticateDeliveryPersonToken;