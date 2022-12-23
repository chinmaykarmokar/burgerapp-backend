import express, { Request, Response } from "express";
import connectDB from "../../config/ormconfig";

// Import Entities
import { Customers } from "../Entities/CustomerEntity";
import { Menu } from "../Entities/MenuEntity";

// Import middlewares
import authenticateCustomerToken from "../../middlewares/customerAuthMiddleware";

// Encrypt password
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const router = express.Router();

const salt = 10;

// Register new customers
router.post("/customerRegister", async (req: Request,res: Response) => {
    try {
        let customerDetails = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            age: req.body.age,
            mobile: req.body.mobile,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password,salt)
        }

        const checkCustomerExists = await connectDB.getRepository(Customers).findOne({where: {email: req.body.email}});

        if (checkCustomerExists?.email == req.body.email) {
            res.json({
                error: "User with this email already exists on our system."
            })
        }

        else {
            await connectDB.getRepository(Customers).insert(customerDetails);
            res.json({
                message: "Customer registered on our platform."
            });
        }
    }
    catch (error) {
        throw error;
    }
})

// List of all customers
router.get("/allCustomers", authenticateCustomerToken, async (req:any ,res: any) => {
    const data = await connectDB.getRepository(Customers).find({ where: {email: req.user.email} });
    res.json({
        data: data,
        worker_process: process.pid
    })
})

// Menu List for all customers
router.get("/menu", authenticateCustomerToken, async (req: Request, res: Response) => {
    const getCompleteMenu =  await connectDB.getRepository(Menu).find();

    if (getCompleteMenu != null || getCompleteMenu != undefined) {
        res.json({
            data: getCompleteMenu
        })
    }
    else {
        res.json({
            error: "Menu cannot be displayed."
        })
    }
})

// Menu for only veg burgers
router.get("/vegMenu", authenticateCustomerToken, async (req: Request, res: Response) => {
    const getCompleteVegMenu =  await connectDB.getRepository(Menu).find({
        where: {category: "Veg"}
    });

    if (getCompleteVegMenu != null || getCompleteVegMenu != undefined) {
        res.json({
            data: getCompleteVegMenu
        })
    }
    else {
        res.json({
            error: "Vegetarian Menu cannot be displayed."
        })
    }
})

export default router;