import express, { Request, Response } from "express";
import connectDB from "../../config/ormconfig";

// Import Entities
import { Admin } from "../Entities/AdminEntity";
import { Inventory } from "../Entities/InventoryEntity";
import { Menu } from "../Entities/MenuEntity";
import { Orders } from "../Entities/OrdersEntity";
import { DeliveryPerson } from "../Entities/DeliveryPerson.Entity";
import { Customers } from "../Entities/CustomerEntity";

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

// Get all customers
router.get("/allCustomers", authenticateAdminToken, async (req: Request, res: Response) => {
    const allCustomers = await connectDB.getRepository(Customers).find();

    res.json({
        data: allCustomers
    })
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

// GET single item from inventory
router.get("/singleInventoryItem/:id", authenticateAdminToken, async (req:any, res: Response) => {
    const checkIfUserExists = await connectDB.getRepository(Admin).findOne({
        where: {email: req?.user?.email}
    })

    if (checkIfUserExists?.email != null || checkIfUserExists?.email != undefined ) {
        const findSingleItemFromInventory = await connectDB.getRepository(Inventory).findOne({
            where: {id: req?.params?.id}
        })

        res.json({
            data: findSingleItemFromInventory
        })
    }
    else {
        res.json({
            message: "Could not find item in the inventory."
        })
    }
})

// Update food items in the inventory
router.put("/updateInventory/:id", authenticateAdminToken, async (req: Request, res: Response) => {
    const findFoodItem = await connectDB.getRepository(Inventory).findOne({
        where: {id: parseInt(req.params.id)}
    })

    const updatedQuantity = {
        quantity: findFoodItem!.quantity + req.body.quantity
    }

    if (findFoodItem != null || findFoodItem != undefined) {
        connectDB.getRepository(Inventory).merge(findFoodItem, updatedQuantity);
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

// Get complete menu
router.get("/getCompleteMenu", authenticateAdminToken, async (req: Request, res: Response) => {
    const getMenu = await connectDB.getRepository(Menu).find();

    res.json({
        data: getMenu
    })
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

// Get all live orders
router.get("/getAllLiveOrders", authenticateAdminToken, async (req: Request, res: Response) => {
    const getAllLiveOrders = await connectDB.getRepository(Orders).find({
        where: {delivery_status: "Live"}
    });

    res.json({
        data: getAllLiveOrders
    })
})

// Get all completed orders
router.get("/getAllCompletedOrders", authenticateAdminToken, async (req: Request, res: Response) => {
    const getAllCompletedOrders = await connectDB.getRepository(Orders).find({
        where: {delivery_status: "Completed"}
    });

    res.json({
        data: getAllCompletedOrders
    })
})

// Get single order to assign
router.get("/getSingleOrderToAssign/:id", authenticateAdminToken, async (req: Request, res: Response) => {
    const getSingleOrder = await connectDB.getRepository(Orders).findOne({
        where: {id: parseInt(req.params.id)}
    })

    res.json({
        data: getSingleOrder
    })
})

// Find Delivery Person Available
router.get("/findDeliveryPersonAvailable/:id", authenticateAdminToken, async (req: Request, res: Response) => {
    const findSingleOrderItem = await connectDB.getRepository(Orders).findOne({
        where: {id: parseInt(req.params.id)}
    })

    const findDeliveryPersonAvailable = await connectDB.getRepository(DeliveryPerson).find({
        where: {status: "available"}
    })

    // console.log(findSingleOrderItem);

    res.json({
        data: findDeliveryPersonAvailable
        // orderSelected: findSingleOrderItem?.id
    })
})

// Assign an order to a delivery person who is available
router.post("/assignOrder/:orderID/:deliveryPersonID", authenticateAdminToken, async (req: any, res: any) => {
    const findAvailableDeliveryPerson = await connectDB.getRepository(DeliveryPerson).findOne({
        where: {id: parseInt(req.params.deliveryPersonID)}
    })

    const findOrder = await connectDB.getRepository(Orders).findOne({
        where: {id: parseInt(req.params.orderID)}
    })

    const findUserFromOrder = await connectDB.getRepository(Customers).find({
        where: {email: findOrder?.email}
    })

    // const provideAddressAndOrderDetailsToDeliveryPerson = {
    //     delivery_address: findUserFromOrder[0]?.address,
    //     items_to_be_delivered: findOrder?.items,
    //     status: "busy",
    //     order_id: parseInt(req.params.orderID)
    // }

    const provideAddressAndOrderDetailsToDeliveryPerson = {
        delivery_address: req.body.delivery_address,
        items_to_be_delivered: req.body.items_to_be_delivered,
        status: req.body.status,
        order_id: req.body.order_id
    }

    await connectDB.getRepository(DeliveryPerson).merge(findAvailableDeliveryPerson!,provideAddressAndOrderDetailsToDeliveryPerson);
    await connectDB.getRepository(DeliveryPerson).save(findAvailableDeliveryPerson!);

    res.json({
        message: `Order assigned to delivery person ${findAvailableDeliveryPerson?.name}`
    })

    // console.log(findUserFromOrder);
})

export default router;