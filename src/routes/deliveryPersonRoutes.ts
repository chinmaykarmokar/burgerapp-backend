import express, {Request, Response} from "express";
import { DeliveryPerson } from "../Entities/DeliveryPerson.Entity";
import connectDB from "../../config/ormconfig";

// Import authentication middleware
import authenticateDeliveryPersonToken from "../../middlewares/deliveryPersonAuthMiddleware";

// Parse JSON and use Router
const app = express();
app.use(express.json());
const router = express.Router();

// Encrypt password
const bcrypt = require("bcrypt");
const salt = 10;

// Register profile for new delivery person
router.post("/deliveryPersonRegister", async (req: Request, res: Response) => {
    try {
        let deliveryPersonPayload = {
            name: req.body.name,
            phone: req.body.phone,
            aadhar_no: req.body.aadhar_no,
            status: req.body.status,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password,salt)
        }
    
        const checkIfDeliveryPersonExists = await connectDB.getRepository(DeliveryPerson).findOne({
            where: {email: req.body.email}
        })
    
        console.log(checkIfDeliveryPersonExists?.email);
    
        if (checkIfDeliveryPersonExists?.email == deliveryPersonPayload?.email) {
            res.json({
                message: `Delivery Person with the following email ${req.body.email} already exists.`
            })
        }
    
        else {
            await connectDB.getRepository(DeliveryPerson).insert(deliveryPersonPayload);
            res.json({
                message: "Delivery Person successfully resgitered on our platform."
            })
        }
    }

    catch (error) {
        throw error
    }
})

// GET data about a single delivery person on authentication
router.get("/deliveryPerson", authenticateDeliveryPersonToken, async (req: any, res: any) => {
    const allDeliveryPersons = await connectDB.getRepository(DeliveryPerson).find(
        { 
            where: {email: req.user.email} 
        });
    res.json({
        data: allDeliveryPersons
    })
})

export default router;