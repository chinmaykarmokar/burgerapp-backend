import express, { Request, Response } from "express";
import connectDB from "../../config/ormconfig";

// Import Entities
import { Admin } from "../Entities/AdminEntity";
import { Inventory } from "../Entities/InventoryEntity";

// Import admin login middleware
import authenticateAdminToken from "../../middlewares/adminAuthMiddleware";

// Using environment variables
import dotenv from "dotenv";
dotenv.config();

// Encrypt password
const bcrypt = require("bcrypt");

const app = express();

const salt = 10;

// Parse JSON
app.use(express.json());

const router = express.Router();

// Create Admin
router.post("/adminRegister", async (req: Request,res: Response) => {
    try {
        const adminDetails = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            mobile: req.body.mobile,
            password: await bcrypt.hash(req.body.password,salt)
        }
        
        await connectDB.getRepository(Admin).insert(adminDetails);

        res.json({
            message: "Admin has been successfully registered."
        })
    }
    catch (error) {
        throw error;
    }
})

// GET data about admin
router.get("/adminDetails", authenticateAdminToken, async (req:any ,res: any) => {
    const data = await connectDB.getRepository(Admin).find({ where: {email: req.user?.email} });
    res.json({
        data: data,
        worker_process: process.pid
    })
})

router.post("/updateInventory", authenticateAdminToken, async (req:Request, res:Response ) => {
    try {
        const inventoryItems = {
            food_item: req.body.food_item,
            quantity: req.body.quantity
        }

        const checkIfFoodItemExists = await connectDB.getRepository(Inventory).findOne({
            where: {food_item: req.body.food_item}
        })

        if (checkIfFoodItemExists?.food_item == inventoryItems?.food_item) {
            res.json({
                message: `This food item (${req.body.food_item}) already exists in the inventory.`
            })
        }
        else {
            await connectDB.getRepository(Inventory).insert(inventoryItems);
            res.json({
                message: "Food items in the inventory updated successfully."
            })
        }
    }
    catch (err) {
        throw err;
    }
})

export default router;