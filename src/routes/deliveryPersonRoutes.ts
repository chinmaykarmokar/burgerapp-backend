import express, {Request, Response} from "express";
import connectDB from "../config/ormconfig";

// Using state variables
import dotenv from "dotenv";
dotenv.config();

// Import Entities
import { DeliveryPerson } from "../Entities/DeliveryPerson.Entity";
import { Orders } from "../Entities/OrdersEntity";
import { Customers } from "../Entities/CustomerEntity";

// Import authentication middleware
import authenticateDeliveryPersonToken from "../middlewares/deliveryPersonAuthMiddleware";
import { Not } from "typeorm";
import authenticateAdminToken from "../middlewares/adminAuthMiddleware";

// Parse JSON and use Router
const app = express();
app.use(express.json());
const router = express.Router();

// Encrypt password
const bcrypt = require("bcrypt");
const salt = 10;

// Import sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

            let message = {
                to: req?.body?.email,
                from: "burpger.dine@gmail.com",
                subject: "You are successfully reistered as our customer!",
                html: `
                <p>
                    Thanks <b>${req.body.name}</b> for registering with Burpger. 
                    <br/>
                    You have registered with the email <b>${req.body.email}</b>.
                    <br/>
                    You can now login to your account and see the orders you have been assigned!
                </p>`
            }

            sgMail.send(message)
            .then((response: any) => {
                console.log(`Email has been sent to customer ${req.body.email}.`)
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

    let message = {
        to: `${findOrderToUpdate?.email}`,
        from: "burpger.dine@gmail.com",
        subject: "Your order was successfully delivered!",
        html: `
        <p>
            Hello, thanks for ordering food from Burpger. 
            <br/>
            Your order was completed successfully by delivery person ${findDeliveryPerson?.name}.
        </p>`
    }

    sgMail.send(message)
    .then((response: any) => {
        console.log(`Email has been sent to customer ${req.body.email}.`)
    })
})

export default router;