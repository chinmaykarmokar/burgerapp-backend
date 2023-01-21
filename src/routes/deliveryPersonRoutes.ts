import express, {Request, Response} from "express";
import connectDB from "../../config/ormconfig";

// Import Entities
import { DeliveryPerson } from "../Entities/DeliveryPerson.Entity";
import { Orders } from "../Entities/OrdersEntity";

// Import authentication middleware
import authenticateDeliveryPersonToken from "../../middlewares/deliveryPersonAuthMiddleware";
import { Not } from "typeorm";

// Parse JSON and use Router
const app = express();
app.use(express.json());
const router = express.Router();

// Encrypt password
const bcrypt = require("bcrypt");
const salt = 10;

// Register profile for new delivery person
router.post("/deliveryPersonRegister", async (req: Request, res: Response, next: any) => {
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
                message: "Delivery Person successfully registered on our platform."
            })
        }
    }

    catch (error) {
       next(error);
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

// Get order assigned to delivery person
router.get("/orderAssigned", authenticateDeliveryPersonToken, async (req: any, res: any) => {
    const findOrdersAssigned = await connectDB.getRepository(DeliveryPerson).find({
        where: [{email: req.user.email, order_id : Not(0)}]
    })

    if (!findOrdersAssigned) {
        res.json({
            message: "No orders assigned."
        })
    }
    else {
        res.json({
            data: findOrdersAssigned
        })
    }
})

// Update order status on completion
router.post("/orderCompletion", authenticateDeliveryPersonToken, async (req: any, res: any) => {
    const findDeliveryPerson = await connectDB.getRepository(DeliveryPerson).findOne({
        where: {email: req.user.email}
    })

    const findOrderToUpdate = await connectDB.getRepository(Orders).findOne({
        where: {id: findDeliveryPerson?.order_id}
    })

    // const orderUpdateData = {
    //     status: "available",
    //     items_to_be_delivered: " ",
    //     delivery_address: " ",
    //     order_id: 0
    // }

    const orderUpdateData = {
        status: req.body.status,
        items_to_be_delivered: req.body.items_to_be_delivered,
        delivery_address: req.body.delivery_address,
        order_id: req.body.order_id
    }

    await connectDB.getRepository(DeliveryPerson).merge(findDeliveryPerson!, orderUpdateData);
    await connectDB.getRepository(DeliveryPerson).save(findDeliveryPerson!);

    await connectDB.getRepository(Orders).merge(findOrderToUpdate!,{delivery_status: "Completed"});
    await connectDB.getRepository(Orders).save(findOrderToUpdate!);

    res.json({
        message: `Your order was completed successfully by delivery person ${findDeliveryPerson?.name}.`
    })
})

export default router;