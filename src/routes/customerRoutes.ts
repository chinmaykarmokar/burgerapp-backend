import express, { Request, Response } from "express";
import { Customers } from "../Entities/CustomerEntity";
import connectDB from "../../config/ormconfig";
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
router.get("/allCustomers", async (req,res) => {
    const data = await connectDB.getRepository(Customers).find();
    res.json({
        data: data,
        worker_process: process.pid
    })
})

export default router;