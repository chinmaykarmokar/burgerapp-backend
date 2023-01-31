"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ormconfig_1 = __importDefault(require("../config/ormconfig"));
// Using state variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import Entities
const CustomerEntity_1 = require("../Entities/CustomerEntity");
const MenuEntity_1 = require("../Entities/MenuEntity");
const CartEntity_1 = require("../Entities/CartEntity");
const OrdersEntity_1 = require("../Entities/OrdersEntity");
const InventoryEntity_1 = require("../Entities/InventoryEntity");
// Import middlewares
const customerAuthMiddleware_1 = __importDefault(require("../middlewares/customerAuthMiddleware"));
const typeorm_1 = require("typeorm");
// Encrypt password
const bcrypt = require("bcrypt");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const router = express_1.default.Router();
// Import sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const salt = 10;
// Register new customers
router.post("/customerRegister", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let customerDetails = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            age: req.body.age,
            address: req.body.address,
            mobile: req.body.mobile,
            email: req.body.email,
            password: yield bcrypt.hash(req.body.password, salt)
        };
        const checkCustomerExists = yield ormconfig_1.default.getRepository(CustomerEntity_1.Customers).findOne({ where: { email: req.body.email } });
        if ((checkCustomerExists === null || checkCustomerExists === void 0 ? void 0 : checkCustomerExists.email) == req.body.email) {
            res.json({
                error: "User with this email already exists on our system."
            });
        }
        else {
            yield ormconfig_1.default.getRepository(CustomerEntity_1.Customers).insert(customerDetails);
            res.json({
                message: "Customer registered on our platform."
            });
            let message = {
                to: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.email,
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
            };
            sgMail.send(message)
                .then((response) => {
                console.log(`Email has been sent to customer ${req.body.email}.`);
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
// List of all customers
router.get("/allCustomers", customerAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield ormconfig_1.default.getRepository(CustomerEntity_1.Customers).find({ where: { email: req.user.email } });
    res.json({
        data: data,
        worker_process: process.pid
    });
}));
// Menu List for all customers
router.get("/menu", customerAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getCompleteMenu = yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).find();
    if (getCompleteMenu != null || getCompleteMenu != undefined) {
        res.json({
            data: getCompleteMenu
        });
    }
    else {
        res.json({
            error: "Menu cannot be displayed."
        });
    }
}));
// Menu for only veg burgers
router.get("/vegMenu", customerAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getCompleteVegMenu = yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).find({
        where: { category: "Veg" }
    });
    if (getCompleteVegMenu != null || getCompleteVegMenu != undefined) {
        res.json({
            data: getCompleteVegMenu
        });
    }
    else {
        res.json({
            error: "Vegetarian Menu cannot be displayed."
        });
    }
}));
// Add burgers to cart
router.post("/addToCart/:id", customerAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    const findCustomerAndAddToCustomerSpecificCart = yield ormconfig_1.default.getRepository(CustomerEntity_1.Customers).find({
        where: { email: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.email }
    });
    const menuList = yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).findOne({
        where: { id: parseInt(req.params.id) }
    });
    if (((_c = findCustomerAndAddToCustomerSpecificCart[0]) === null || _c === void 0 ? void 0 : _c.email) != null && menuList != null) {
        const itemToBeAddedInCart = {
            email: (_d = findCustomerAndAddToCustomerSpecificCart[0]) === null || _d === void 0 ? void 0 : _d.email,
            burger_name: menuList === null || menuList === void 0 ? void 0 : menuList.burger_name,
            burger_price: menuList === null || menuList === void 0 ? void 0 : menuList.price,
            new_burger_price: menuList === null || menuList === void 0 ? void 0 : menuList.price
        };
        const checkIfBurgerAlreadyExists = yield ormconfig_1.default.getRepository(CartEntity_1.Cart).findOne({
            where: {
                burger_name: menuList === null || menuList === void 0 ? void 0 : menuList.burger_name,
                email: (_e = findCustomerAndAddToCustomerSpecificCart[0]) === null || _e === void 0 ? void 0 : _e.email
            }
        });
        if ((checkIfBurgerAlreadyExists === null || checkIfBurgerAlreadyExists === void 0 ? void 0 : checkIfBurgerAlreadyExists.burger_name) == (itemToBeAddedInCart === null || itemToBeAddedInCart === void 0 ? void 0 : itemToBeAddedInCart.burger_name)) {
            res.json({
                message: `${menuList === null || menuList === void 0 ? void 0 : menuList.burger_name} already exists in your cart.`
            });
        }
        else {
            yield ormconfig_1.default.getRepository(CartEntity_1.Cart).insert(itemToBeAddedInCart);
            res.json({
                message: `${menuList === null || menuList === void 0 ? void 0 : menuList.burger_name} successfully added to your cart.`
            });
        }
    }
    else {
        res.json({
            error: `${menuList === null || menuList === void 0 ? void 0 : menuList.burger_name} could not be added to the cart.`
        });
    }
}));
// Show burgers in the cart
router.get("/getCartItems", customerAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user != null || req.user != undefined) {
        const showAllBurgersinCart = yield ormconfig_1.default.getRepository(CartEntity_1.Cart).find({
            where: { email: req.user.email }
        });
        res.json({
            data: showAllBurgersinCart
        });
    }
    else {
        error: "Cart cannot be displayed.";
    }
}));
// Update to add quantity of burgers in the cart
router.put("/updateCartToAdd/:id", customerAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findBurgerToUpdate = yield ormconfig_1.default.getRepository(CartEntity_1.Cart).findOne({
        where: { id: parseInt(req.params.id) }
    });
    let quantityToBeAdded = (findBurgerToUpdate === null || findBurgerToUpdate === void 0 ? void 0 : findBurgerToUpdate.quantity_of_burger) + 1;
    console.log(quantityToBeAdded);
    const quantityToUpdate = {
        quantity_of_burger: quantityToBeAdded,
        new_burger_price: findBurgerToUpdate.new_burger_price + findBurgerToUpdate.burger_price
    };
    if (findBurgerToUpdate != null || findBurgerToUpdate != undefined) {
        yield ormconfig_1.default.getRepository(CartEntity_1.Cart).merge(findBurgerToUpdate, quantityToUpdate);
        yield ormconfig_1.default.getRepository(CartEntity_1.Cart).save(findBurgerToUpdate);
        res.json({
            message: `Quantity for ${findBurgerToUpdate === null || findBurgerToUpdate === void 0 ? void 0 : findBurgerToUpdate.burger_name} updated.`
        });
    }
    else {
        res.json({
            error: `Item in the cart could not be updated successfully.`
        });
    }
}));
// Update to remove/reduce quantity of burgers in the cart
router.put("/updateCartToRemove/:id", customerAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findBurgerToUpdate = yield ormconfig_1.default.getRepository(CartEntity_1.Cart).findOne({
        where: { id: parseInt(req.params.id) }
    });
    let quantityToBeAdded = findBurgerToUpdate.quantity_of_burger - 1;
    const quantityToUpdate = {
        quantity_of_burger: quantityToBeAdded,
        new_burger_price: findBurgerToUpdate.new_burger_price - findBurgerToUpdate.burger_price
    };
    if (findBurgerToUpdate.quantity_of_burger <= 1) {
        yield ormconfig_1.default.getRepository(CartEntity_1.Cart).delete({
            burger_name: findBurgerToUpdate === null || findBurgerToUpdate === void 0 ? void 0 : findBurgerToUpdate.burger_name
        });
        return res.json({
            message: `${findBurgerToUpdate.burger_name} removed from your cart successfully.`
        });
    }
    if (findBurgerToUpdate != null || findBurgerToUpdate != undefined) {
        yield ormconfig_1.default.getRepository(CartEntity_1.Cart).merge(findBurgerToUpdate, quantityToUpdate);
        yield ormconfig_1.default.getRepository(CartEntity_1.Cart).save(findBurgerToUpdate);
        return res.json({
            message: `Quantity for ${findBurgerToUpdate === null || findBurgerToUpdate === void 0 ? void 0 : findBurgerToUpdate.burger_name} updated.`
        });
    }
    else {
        res.json({
            error: `Item in the cart could not be updated successfully.`
        });
    }
}));
// Create order for specific user
router.post("/createOrder", customerAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const checkIfCustomerExists = yield ormconfig_1.default.getRepository(CustomerEntity_1.Customers).findOne({
        where: { email: req.user.email }
    });
    const checkIfCustomerHasLiveOrder = yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).findOne({
        where: {
            email: checkIfCustomerExists === null || checkIfCustomerExists === void 0 ? void 0 : checkIfCustomerExists.email,
            delivery_status: "Live"
        }
    });
    if (checkIfCustomerExists !== null && checkIfCustomerExists !== undefined) {
        const checkCartItemsForSpecificUser = yield ormconfig_1.default.getRepository(CartEntity_1.Cart).find({
            where: { email: req.user.email }
        });
        if (checkCartItemsForSpecificUser.length == 0) {
            return res.json({
                message: "Your cart is empty and hence items could not be added."
            });
        }
        if ((checkIfCustomerHasLiveOrder === null || checkIfCustomerHasLiveOrder === void 0 ? void 0 : checkIfCustomerHasLiveOrder.delivery_status) == "Live") {
            return res.json({
                message: "You already have an order that is live, hence order cannot be placed."
            });
        }
        else {
            // const cartPriceArray = checkCartItemsForSpecificUser.map((price) => {
            //     return price?.new_burger_price
            // })
            // const calculateTotalCartPrice = cartPriceArray.reduce((price1, pricen) => price1 + pricen, 0);
            const cartBurgersArray = checkCartItemsForSpecificUser.map((burger) => {
                return burger === null || burger === void 0 ? void 0 : burger.burger_name;
            });
            // const listOfBurgersInCart = cartBurgersArray.toString();
            const createOrderObject = {
                email: req.body.email,
                items: req.body.items,
                price: req.body.price,
                address: req.body.address
            };
            const findBurgerIngredientsFromTheMenu = yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).find({
                where: { burger_name: (0, typeorm_1.In)(cartBurgersArray) }
            });
            const segregateBurgerIngredients = findBurgerIngredientsFromTheMenu.map((burgerIngredient) => {
                return {
                    burgers_per_bun: burgerIngredient === null || burgerIngredient === void 0 ? void 0 : burgerIngredient.burger_buns_per_burger,
                    onions_per_bun: burgerIngredient === null || burgerIngredient === void 0 ? void 0 : burgerIngredient.onions_per_bun,
                    tomatoes_per_bun: burgerIngredient === null || burgerIngredient === void 0 ? void 0 : burgerIngredient.tomatoes_per_bun,
                    lettuce_per_bun: burgerIngredient === null || burgerIngredient === void 0 ? void 0 : burgerIngredient.lettuce_per_bun,
                    chicken_patty: burgerIngredient === null || burgerIngredient === void 0 ? void 0 : burgerIngredient.chicken_patty,
                    paneer_patty: burgerIngredient === null || burgerIngredient === void 0 ? void 0 : burgerIngredient.paneer_patty,
                    cheese: burgerIngredient === null || burgerIngredient === void 0 ? void 0 : burgerIngredient.cheese
                };
            });
            const noOfBurgerBunsInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient === null || singleIngredient === void 0 ? void 0 : singleIngredient.burgers_per_bun;
            });
            const totalBuns = noOfBurgerBunsInOrder.reduce((bun1, bunn) => bun1 + bunn, 0);
            const noOfOnionsInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient === null || singleIngredient === void 0 ? void 0 : singleIngredient.onions_per_bun;
            });
            const exactQuantityOfOnionsInOrder = noOfOnionsInOrder.map(Number);
            const totalOnions = exactQuantityOfOnionsInOrder.reduce((onion1, onionn) => onion1 + onionn, 0);
            const noOfTomatoesInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient === null || singleIngredient === void 0 ? void 0 : singleIngredient.tomatoes_per_bun;
            });
            const exactQuantityOfTomatoesInOrder = noOfTomatoesInOrder.map(Number);
            const totalTomatoes = exactQuantityOfTomatoesInOrder.reduce((tomato1, tomaton) => tomato1 + tomaton, 0);
            const noOfLettuceInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient === null || singleIngredient === void 0 ? void 0 : singleIngredient.lettuce_per_bun;
            });
            const totalLettuce = noOfLettuceInOrder.reduce((lettuce1, lettucen) => lettuce1 + lettucen, 0);
            const noOfChickenPattyInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient === null || singleIngredient === void 0 ? void 0 : singleIngredient.chicken_patty;
            });
            const totalChickenPatty = noOfChickenPattyInOrder.reduce((chicken1, chickenn) => chicken1 + chickenn, 0);
            const noOfPaneerPattyInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient === null || singleIngredient === void 0 ? void 0 : singleIngredient.paneer_patty;
            });
            const totalPaneerPatty = noOfPaneerPattyInOrder.reduce((paneer1, paneern) => paneer1 + paneern, 0);
            const noOfCheeseInOrder = segregateBurgerIngredients.map((singleIngredient) => {
                return singleIngredient === null || singleIngredient === void 0 ? void 0 : singleIngredient.cheese;
            });
            const totalCheese = noOfCheeseInOrder.reduce((cheese1, cheesen) => cheese1 + cheesen, 0);
            // Update Inventory Items on placing order
            const getTomatoesFromInventory = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
                where: { food_item: "Tomatoes" }
            });
            const getOnionsFromInventory = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
                where: { food_item: "Onions" }
            });
            const getBurgerBunsFromInventory = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
                where: { food_item: "Burger Buns" }
            });
            const getChickenPattyFromInventory = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
                where: { food_item: "Chicken Patty" }
            });
            const getPaneerPattyFromInventory = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
                where: { food_item: "Paneer Patty" }
            });
            const getLettuceFromInventory = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
                where: { food_item: "Lettuce" }
            });
            const getCheeseFromInventory = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
                where: { food_item: "Cheese" }
            });
            if (getTomatoesFromInventory.quantity || getOnionsFromInventory.quantity || getBurgerBunsFromInventory.quantity ||
                getChickenPattyFromInventory.quantity || getPaneerPattyFromInventory.quantity || getLettuceFromInventory.quantity ||
                getCheeseFromInventory.quantity <= 10) {
                res.json({
                    message: "Not enough stock of items in the inventory hence order cannot be placed."
                });
            }
            const updateTomatoesInTheInventory = {
                quantity: getTomatoesFromInventory.quantity - totalTomatoes
            };
            const updateOnionsInTheInventory = {
                quantity: getOnionsFromInventory.quantity - totalOnions
            };
            const updateBurgerBunsInTheInventory = {
                quantity: getBurgerBunsFromInventory.quantity - totalBuns
            };
            const updateChickenPattyInTheInventory = {
                quantity: getChickenPattyFromInventory.quantity - totalChickenPatty
            };
            const updatePaneerPattyInTheInventory = {
                quantity: getPaneerPattyFromInventory.quantity - totalPaneerPatty
            };
            const updateLettuceInTheInventory = {
                quantity: getLettuceFromInventory.quantity - totalLettuce
            };
            const updateCheeseInTheInventory = {
                quantity: getCheeseFromInventory.quantity - totalCheese
            };
            // Place Order
            yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).insert(createOrderObject);
            let message = {
                to: `${checkIfCustomerExists === null || checkIfCustomerExists === void 0 ? void 0 : checkIfCustomerExists.email}`,
                from: "burpger.dine@gmail.com",
                subject: "Your order was place successfully!",
                html: `
                <p>
                    Hello, your order was placed successfully and will be delivered inside an hour. 
                    <br/>
                    Thank you for using Burpger!
                </p>`
            };
            sgMail.send(message)
                .then((response) => {
                console.log(`Email has been sent to customer ${req.body.email}.`);
            });
            // Delete existing items for that user from their cart
            yield ormconfig_1.default.getRepository(CartEntity_1.Cart).delete({
                email: checkIfCustomerExists === null || checkIfCustomerExists === void 0 ? void 0 : checkIfCustomerExists.email
            });
            // Update Inventory with placing of order
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).merge(getTomatoesFromInventory, updateTomatoesInTheInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).save(getTomatoesFromInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).merge(getOnionsFromInventory, updateOnionsInTheInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).save(getOnionsFromInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).merge(getBurgerBunsFromInventory, updateBurgerBunsInTheInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).save(getBurgerBunsFromInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).merge(getChickenPattyFromInventory, updateChickenPattyInTheInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).save(getChickenPattyFromInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).merge(getPaneerPattyFromInventory, updatePaneerPattyInTheInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).save(getPaneerPattyFromInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).merge(getLettuceFromInventory, updateLettuceInTheInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).save(getLettuceFromInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).merge(getCheeseFromInventory, updateCheeseInTheInventory);
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).save(getCheeseFromInventory);
            res.json({
                message: "Order placed successfully."
            });
        }
    }
    else {
        res.json({
            error: "Order could not be placed."
        });
    }
}));
router.get("/getMyOrders", customerAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const checkCustomerExists = yield ormconfig_1.default.getRepository(CustomerEntity_1.Customers).findOne({
        where: { email: req.user.email }
    });
    if ((checkCustomerExists === null || checkCustomerExists === void 0 ? void 0 : checkCustomerExists.email) != null || (checkCustomerExists === null || checkCustomerExists === void 0 ? void 0 : checkCustomerExists.email) != undefined) {
        const getUserSpecificOrders = yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).find({
            where: { email: req.user.email }
        });
        res.json({
            data: getUserSpecificOrders
        });
    }
    else {
        res.json({
            message: "Could not load orders."
        });
    }
}));
exports.default = router;
