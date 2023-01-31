import express, { Request, Response } from "express";
import connectDB from "../config/ormconfig";

// Using state variables
import dotenv from "dotenv";
dotenv.config();

// Import Entities
import { Customers } from "../Entities/CustomerEntity";
import { Menu } from "../Entities/MenuEntity";
import { Cart } from "../Entities/CartEntity";
import { Orders } from "../Entities/OrdersEntity";
import { Inventory } from "../Entities/InventoryEntity";

// Import middlewares
import authenticateCustomerToken from "../middlewares/customerAuthMiddleware";
import { In } from "typeorm";

// Encrypt password
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const router = express.Router();

// Import sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const salt = 10;

// Register new customers
router.post("/customerRegister", async (req: Request,res: Response, next: any) => {
    try {
        let customerDetails = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            age: req.body.age,
            address: req.body.address,
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

            let message = {
                to: req?.body?.email,
                from: "burpger.dine@gmail.com",
                subject: "You are successfully registered as our customer!",
                html: `
                <p>
                    Thanks <b>${req.body.firstname}</b> for registering with Burpger. 
                    <br/>
                    You have registered with the email <b>${req.body.email}</b>.
                    <br/>
                    You can now login to your account and order the burgers of your choice!
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

// Add burgers to cart
router.post("/addToCart/:id", authenticateCustomerToken, async (req: any, res: any) => {
    const findCustomerAndAddToCustomerSpecificCart = await connectDB.getRepository(Customers).find({
        where: {email: req?.user?.email} 
    })

    const menuList = await connectDB.getRepository(Menu).findOne({
        where: {id: parseInt(req.params.id)}
    });

    if (findCustomerAndAddToCustomerSpecificCart[0]?.email != null && menuList != null) {
        const itemToBeAddedInCart = {
            email: findCustomerAndAddToCustomerSpecificCart[0]?.email,
            burger_name: menuList?.burger_name,
            burger_price: menuList?.price,
            new_burger_price: menuList?.price
        }

        const checkIfBurgerAlreadyExists = await connectDB.getRepository(Cart).findOne({
            where: {
                burger_name: menuList?.burger_name,
                email: findCustomerAndAddToCustomerSpecificCart[0]?.email
            }
        })

        if (checkIfBurgerAlreadyExists?.burger_name == itemToBeAddedInCart?.burger_name) {
            res.json({
                message: `${menuList?.burger_name} already exists in your cart.`
            })
        }

        else {
            await connectDB.getRepository(Cart).insert(itemToBeAddedInCart);

            res.json({
                message: `${menuList?.burger_name} successfully added to your cart.`
            })
        }
    }

    else {
        res.json({
            error: `${menuList?.burger_name} could not be added to the cart.`
        })
    }
})

// Show burgers in the cart
router.get("/getCartItems", authenticateCustomerToken, async (req: any, res: any) => {
    if (req.user != null || req.user != undefined) {
        const showAllBurgersinCart = await connectDB.getRepository(Cart).find({
            where: {email: req.user.email}
        })

        res.json({
            data: showAllBurgersinCart
        })
    }
    else {
        error: "Cart cannot be displayed."
    }
})

// Update to add quantity of burgers in the cart
router.put("/updateCartToAdd/:id", authenticateCustomerToken, async (req: any, res: any) => {
    const findBurgerToUpdate = await connectDB.getRepository(Cart).findOne({
        where: {id: parseInt(req.params.id)}
    })

    let quantityToBeAdded = findBurgerToUpdate?.quantity_of_burger! + 1;
    console.log(quantityToBeAdded);

    const quantityToUpdate = {
        quantity_of_burger: quantityToBeAdded,
        new_burger_price: findBurgerToUpdate!.new_burger_price + findBurgerToUpdate!.burger_price
    }

    if (findBurgerToUpdate != null || findBurgerToUpdate != undefined) {
        await connectDB.getRepository(Cart).merge(findBurgerToUpdate, quantityToUpdate);
        await connectDB.getRepository(Cart).save(findBurgerToUpdate);

        res.json({
            message: `Quantity for ${findBurgerToUpdate?.burger_name} updated.`
        })
    }
    else {
        res.json({
            error: `Item in the cart could not be updated successfully.`
        })
    }
})

// Update to remove/reduce quantity of burgers in the cart
router.put("/updateCartToRemove/:id", authenticateCustomerToken, async (req: any, res: any) => {
    const findBurgerToUpdate = await connectDB.getRepository(Cart).findOne({
        where: {id: parseInt(req.params.id)}
    })

    let quantityToBeAdded = findBurgerToUpdate!.quantity_of_burger - 1;

    const quantityToUpdate = {
        quantity_of_burger: quantityToBeAdded,
        new_burger_price: findBurgerToUpdate!.new_burger_price - findBurgerToUpdate!.burger_price
    }

    if (findBurgerToUpdate!.quantity_of_burger <= 1) {
        await connectDB.getRepository(Cart).delete({
            burger_name: findBurgerToUpdate?.burger_name
        });
        
        return res.json({
            message: `${findBurgerToUpdate!.burger_name} removed from your cart successfully.` 
        })
    }

    if (findBurgerToUpdate != null || findBurgerToUpdate != undefined) {
        await connectDB.getRepository(Cart).merge(findBurgerToUpdate, quantityToUpdate);
        await connectDB.getRepository(Cart).save(findBurgerToUpdate);

        return res.json({
            message: `Quantity for ${findBurgerToUpdate?.burger_name} updated.`
        })
    }

    else {
        res.json({
            error: `Item in the cart could not be updated successfully.`
        })
    }
})

// Create order for specific user
router.post("/createOrder", authenticateCustomerToken, async (req: any, res: any) => {
    const checkIfCustomerExists = await connectDB.getRepository(Customers).findOne({
        where: {email: req.user.email}
    })

    const checkIfCustomerHasLiveOrder = await connectDB.getRepository(Orders).findOne({
        where: {
            email: checkIfCustomerExists?.email,
            delivery_status: "Live"
        }
    })

    if (checkIfCustomerExists !== null && checkIfCustomerExists !== undefined) {
        const checkCartItemsForSpecificUser = await connectDB.getRepository(Cart).find({
            where: {email: req.user.email}
        })

        if (checkCartItemsForSpecificUser.length == 0) {
            return res.json({
                message: "Your cart is empty and hence items could not be added."
            })
        }

        if (checkIfCustomerHasLiveOrder?.delivery_status == "Live") {
            return res.json({
                message: "You already have an order that is live, hence order cannot be placed."
            })
        }

        else {
            // const cartPriceArray = checkCartItemsForSpecificUser.map((price) => {
            //     return price?.new_burger_price
            // })
    
            // const calculateTotalCartPrice = cartPriceArray.reduce((price1, pricen) => price1 + pricen, 0);
    
            const cartBurgersArray = checkCartItemsForSpecificUser.map((burger) => {
                return burger?.burger_name
            })
    
            // const listOfBurgersInCart = cartBurgersArray.toString();

            const createOrderObject = {
                email: req.body.email,
                items: req.body.items,
                price: req.body.price,
                address: req.body.address
            }
    
            const findBurgerIngredientsFromTheMenu = await connectDB.getRepository(Menu).find({
                where: {burger_name: In(cartBurgersArray)}
            })
    
            const segregateBurgerIngredients = findBurgerIngredientsFromTheMenu.map((burgerIngredient) => {
                return {
                    burgers_per_bun: burgerIngredient?.burger_buns_per_burger,
                    onions_per_bun: burgerIngredient?.onions_per_bun,
                    tomatoes_per_bun: burgerIngredient?.tomatoes_per_bun,
                    lettuce_per_bun: burgerIngredient?.lettuce_per_bun,
                    chicken_patty: burgerIngredient?.chicken_patty,
                    paneer_patty: burgerIngredient?.paneer_patty,
                    cheese: burgerIngredient?.cheese
                }
            })
    
            const noOfBurgerBunsInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient?.burgers_per_bun
            })
    
            const totalBuns = noOfBurgerBunsInOrder.reduce((bun1, bunn) => bun1 + bunn, 0);
    
            const noOfOnionsInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient?.onions_per_bun
            })
    
            const exactQuantityOfOnionsInOrder = noOfOnionsInOrder.map(Number);
    
            const totalOnions = exactQuantityOfOnionsInOrder.reduce((onion1, onionn) => onion1 + onionn, 0);
    
            const noOfTomatoesInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient?.tomatoes_per_bun
            })
    
            const exactQuantityOfTomatoesInOrder = noOfTomatoesInOrder.map(Number);
    
            const totalTomatoes = exactQuantityOfTomatoesInOrder.reduce((tomato1, tomaton) => tomato1 + tomaton, 0);
    
            const noOfLettuceInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient?.lettuce_per_bun
            })
    
            const totalLettuce = noOfLettuceInOrder.reduce((lettuce1, lettucen) => lettuce1 + lettucen, 0);
    
            const noOfChickenPattyInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient?.chicken_patty
            })
    
            const totalChickenPatty = noOfChickenPattyInOrder.reduce((chicken1, chickenn) => chicken1 + chickenn, 0);
    
            const noOfPaneerPattyInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient?.paneer_patty
            })
    
            const totalPaneerPatty = noOfPaneerPattyInOrder.reduce((paneer1, paneern) => paneer1 + paneern, 0);
    
            const noOfCheeseInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient?.cheese
            })
    
            const totalCheese = noOfCheeseInOrder.reduce((cheese1, cheesen) => cheese1 + cheesen, 0);
    
            // Update Inventory Items on placing order
            const getTomatoesFromInventory = await connectDB.getRepository(Inventory).findOne({
                where: {food_item: "Tomatoes"}
            });
    
            const getOnionsFromInventory = await connectDB.getRepository(Inventory).findOne({
                where: {food_item: "Onions"}
            });
    
            const getBurgerBunsFromInventory = await connectDB.getRepository(Inventory).findOne({
                where: {food_item: "Burger Buns"}
            });
    
            const getChickenPattyFromInventory = await connectDB.getRepository(Inventory).findOne({
                where: {food_item: "Chicken Patty"}
            });
    
            const getPaneerPattyFromInventory = await connectDB.getRepository(Inventory).findOne({
                where: {food_item: "Paneer Patty"}
            });
    
            const getLettuceFromInventory = await connectDB.getRepository(Inventory).findOne({
                where: {food_item: "Lettuce"}
            });
    
            const getCheeseFromInventory = await connectDB.getRepository(Inventory).findOne({
                where: {food_item: "Cheese"}
            });

            if (
                getTomatoesFromInventory!.quantity || getOnionsFromInventory!.quantity || getBurgerBunsFromInventory!.quantity ||
                getChickenPattyFromInventory!.quantity || getPaneerPattyFromInventory!.quantity || getLettuceFromInventory!.quantity || 
                getCheeseFromInventory!.quantity <= 10
            ) {
                res.json({
                    message: "Not enough stock of items in the inventory hence order cannot be placed."
                })
            }
    
            const updateTomatoesInTheInventory = {
                quantity: getTomatoesFromInventory!.quantity - totalTomatoes
            }
    
            const updateOnionsInTheInventory = {
                quantity: getOnionsFromInventory!.quantity - totalOnions
            }
    
            const updateBurgerBunsInTheInventory = {
                quantity: getBurgerBunsFromInventory!.quantity - totalBuns
            }
    
            const updateChickenPattyInTheInventory = {
                quantity: getChickenPattyFromInventory!.quantity - totalChickenPatty
            }
    
            const updatePaneerPattyInTheInventory = {
                quantity: getPaneerPattyFromInventory!.quantity - totalPaneerPatty
            }
    
            const updateLettuceInTheInventory = {
                quantity: getLettuceFromInventory!.quantity - totalLettuce
            }
    
            const updateCheeseInTheInventory = {
                quantity: getCheeseFromInventory!.quantity - totalCheese
            }

            // Place Order
            await connectDB.getRepository(Orders).insert(createOrderObject);

            let message = {
                to: `${checkIfCustomerExists?.email}`,
                from: "burpger.dine@gmail.com",
                subject: "Your order was place successfully!",
                html: `
                <p>
                    Hello, your order was placed successfully and will be delivered inside an hour. 
                    <br/>
                    Thank you for using Burpger!
                </p>`
            }

            sgMail.send(message)
            .then((response: any) => {
                console.log(`Email has been sent to customer ${req.body.email}.`)
            })
    
            // Delete existing items for that user from their cart
            await connectDB.getRepository(Cart).delete({
                email: checkIfCustomerExists?.email
            })
    
            // Update Inventory with placing of order
            await connectDB.getRepository(Inventory).merge(getTomatoesFromInventory!, updateTomatoesInTheInventory);
            await connectDB.getRepository(Inventory).save(getTomatoesFromInventory!);
            await connectDB.getRepository(Inventory).merge(getOnionsFromInventory!, updateOnionsInTheInventory);
            await connectDB.getRepository(Inventory).save(getOnionsFromInventory!);
            await connectDB.getRepository(Inventory).merge(getBurgerBunsFromInventory!, updateBurgerBunsInTheInventory);
            await connectDB.getRepository(Inventory).save(getBurgerBunsFromInventory!);
            await connectDB.getRepository(Inventory).merge(getChickenPattyFromInventory!, updateChickenPattyInTheInventory);
            await connectDB.getRepository(Inventory).save(getChickenPattyFromInventory!);
            await connectDB.getRepository(Inventory).merge(getPaneerPattyFromInventory!, updatePaneerPattyInTheInventory);
            await connectDB.getRepository(Inventory).save(getPaneerPattyFromInventory!);
            await connectDB.getRepository(Inventory).merge(getLettuceFromInventory!, updateLettuceInTheInventory);
            await connectDB.getRepository(Inventory).save(getLettuceFromInventory!);
            await connectDB.getRepository(Inventory).merge(getCheeseFromInventory!, updateCheeseInTheInventory);
            await connectDB.getRepository(Inventory).save(getCheeseFromInventory!);

            res.json({
                message: "Order placed successfully."
            })
        }
    }
    else {
        res.json({
            error: "Order could not be placed."
        })
    }
})

router.get("/getMyOrders", authenticateCustomerToken, async (req: any, res: Response) => {
    const checkCustomerExists = await connectDB.getRepository(Customers).findOne({
        where: {email: req.user.email}
    })

    if (checkCustomerExists?.email != null || checkCustomerExists?.email != undefined) {
        const getUserSpecificOrders = await connectDB.getRepository(Orders).find({
            where: {email: req.user.email}
        })

        res.json({
            data: getUserSpecificOrders
        })
    }
    else {
        res.json({
            message: "Could not load orders."
        })
    }
})

export default router;