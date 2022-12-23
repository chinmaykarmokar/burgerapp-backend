import express, { Request, Response } from "express";
import connectDB from "../../config/ormconfig";

// Import Entities
import { Admin } from "../Entities/AdminEntity";
import { Inventory } from "../Entities/InventoryEntity";
import { Menu } from "../Entities/MenuEntity";

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

// Add new food items in the inventory
router.post("/addToInventory", authenticateAdminToken, async (req:Request, res:Response ) => {
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

// GET all the food items inventory
router.get("/allFoodItems", authenticateAdminToken, async (req: Request, res: Response) => {
    const allFoodItemsInTheInventory = await connectDB.getRepository(Inventory).find();

    if (allFoodItemsInTheInventory != null || allFoodItemsInTheInventory != undefined) {
        res.json({
            data: allFoodItemsInTheInventory
        })
    }
    else {
        res.json({
            error: "No values could be found."
        })
    }
})

// Update food items in the inventory
router.put("/updateInventory/:id", authenticateAdminToken, async (req: Request, res: Response) => {
    const findFoodItem = await connectDB.getRepository(Inventory).findOne({
        where: {id: parseInt(req.params.id)}
    })

    if (findFoodItem != null || findFoodItem != undefined) {
        connectDB.getRepository(Inventory).merge(findFoodItem,req.body);
        await connectDB.getRepository(Inventory).save(findFoodItem);
        res.json({
            message: "Food Item has been updated successfully in the inventory."
        })
    }
    else {
        res.json({
            error: "Food Item could not be updated."
        })
    }
})

// Create Menu 
router.post("/addToMenu", authenticateAdminToken, async (req: Request, res: Response) => {
    try {
        const menuItemList = {
            burger_name: req.body.burger_name,
            chicken_patty: req.body.chicken_patty,
            paneer_patty: req.body.paneer_patty,
            cheese: req.body.cheese,
            category: req.body.category,
            price: req.body.price
        }

        const checkIfBurgerExists = await connectDB.getRepository(Menu).findOne({
            where: {burger_name: req.body.burger_name}
        })

        if (checkIfBurgerExists?.burger_name == menuItemList?.burger_name) {
            res.json({
                message: `${req.body.burger_name} already exists in the menu.`
            })
        }

        else {
            await connectDB.getRepository(Menu).insert(menuItemList);
            res.json({
                message: "Burger successfully added to the menu."
            })
        }
    }
    catch (err) {
        throw err;
    }
})

// Update Menu
router.put("/updateMenu/:id", authenticateAdminToken, async (req: Request, res: Response) => {
    const findFoodItemToUpdate = await connectDB.getRepository(Menu).findOne({
        where: {id: parseInt(req.params.id)}
    })

    if (findFoodItemToUpdate != null || findFoodItemToUpdate != undefined) {
        await connectDB.getRepository(Menu).merge(findFoodItemToUpdate,req.body);
        await connectDB.getRepository(Menu).save(findFoodItemToUpdate);

        res.json({
            message: `${findFoodItemToUpdate?.burger_name} updated successfully.`
        })
    }
    else {
        res.json({
            error: `${findFoodItemToUpdate!.burger_name} could not be updated.`
        })
    }
})

export default router;