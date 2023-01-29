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
// Import Entities
const AdminEntity_1 = require("../Entities/AdminEntity");
const InventoryEntity_1 = require("../Entities/InventoryEntity");
const MenuEntity_1 = require("../Entities/MenuEntity");
const OrdersEntity_1 = require("../Entities/OrdersEntity");
const DeliveryPerson_Entity_1 = require("../Entities/DeliveryPerson.Entity");
const CustomerEntity_1 = require("../Entities/CustomerEntity");
// Import admin login middleware
const adminAuthMiddleware_1 = __importDefault(require("../middlewares/adminAuthMiddleware"));
// Using environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Encrypt password
const bcrypt = require("bcrypt");
const app = (0, express_1.default)();
const salt = 10;
// Parse JSON
app.use(express_1.default.json());
const router = express_1.default.Router();
// Import sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// Create Admin
router.post("/adminRegister", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminDetails = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            mobile: req.body.mobile,
            password: yield bcrypt.hash(req.body.password, salt)
        };
        yield ormconfig_1.default.getRepository(AdminEntity_1.Admin).insert(adminDetails);
        res.json({
            message: "Admin has been successfully registered."
        });
    }
    catch (error) {
        next(error);
    }
}));
// Get all customers
router.get("/allCustomers", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allCustomers = yield ormconfig_1.default.getRepository(CustomerEntity_1.Customers).find();
    res.json({
        data: allCustomers
    });
}));
// GET data about admin
router.get("/adminDetails", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = yield ormconfig_1.default.getRepository(AdminEntity_1.Admin).find({ where: { email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email } });
    res.json({
        data: data,
        worker_process: process.pid
    });
}));
// Add new food items in the inventory
router.post("/addToInventory", adminAuthMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inventoryItems = {
            food_item: req.body.food_item,
            quantity: req.body.quantity
        };
        const checkIfFoodItemExists = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
            where: { food_item: req.body.food_item }
        });
        if ((checkIfFoodItemExists === null || checkIfFoodItemExists === void 0 ? void 0 : checkIfFoodItemExists.food_item) == (inventoryItems === null || inventoryItems === void 0 ? void 0 : inventoryItems.food_item)) {
            res.json({
                message: `This food item (${req.body.food_item}) already exists in the inventory.`
            });
        }
        else {
            yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).insert(inventoryItems);
            res.json({
                message: "Food items in the inventory updated successfully."
            });
        }
    }
    catch (err) {
        next(err);
    }
}));
// GET all the food items inventory
router.get("/allFoodItems", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allFoodItemsInTheInventory = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).find();
    if (allFoodItemsInTheInventory != null || allFoodItemsInTheInventory != undefined) {
        res.json({
            data: allFoodItemsInTheInventory
        });
    }
    else {
        res.json({
            error: "No values could be found."
        });
    }
}));
// GET single item from inventory
router.get("/singleInventoryItem/:id", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const checkIfUserExists = yield ormconfig_1.default.getRepository(AdminEntity_1.Admin).findOne({
        where: { email: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.email }
    });
    if ((checkIfUserExists === null || checkIfUserExists === void 0 ? void 0 : checkIfUserExists.email) != null || (checkIfUserExists === null || checkIfUserExists === void 0 ? void 0 : checkIfUserExists.email) != undefined) {
        const findSingleItemFromInventory = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
            where: { id: (_c = req === null || req === void 0 ? void 0 : req.params) === null || _c === void 0 ? void 0 : _c.id }
        });
        res.json({
            data: findSingleItemFromInventory
        });
    }
    else {
        res.json({
            message: "Could not find item in the inventory."
        });
    }
}));
// Update food items in the inventory
router.put("/updateInventory/:id", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findFoodItem = yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).findOne({
        where: { id: parseInt(req.params.id) }
    });
    const updatedQuantity = {
        quantity: findFoodItem.quantity + req.body.quantity
    };
    if (findFoodItem != null || findFoodItem != undefined) {
        ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).merge(findFoodItem, updatedQuantity);
        yield ormconfig_1.default.getRepository(InventoryEntity_1.Inventory).save(findFoodItem);
        res.json({
            message: "Food Item has been updated successfully in the inventory."
        });
    }
    else {
        res.json({
            error: "Food Item could not be updated."
        });
    }
}));
// Create Menu 
router.post("/addToMenu", adminAuthMiddleware_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const menuItemList = {
            burger_name: req.body.burger_name,
            chicken_patty: req.body.chicken_patty,
            paneer_patty: req.body.paneer_patty,
            cheese: req.body.cheese,
            category: req.body.category,
            price: req.body.price
        };
        const checkIfBurgerExists = yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).findOne({
            where: { burger_name: req.body.burger_name }
        });
        if ((checkIfBurgerExists === null || checkIfBurgerExists === void 0 ? void 0 : checkIfBurgerExists.burger_name) == (menuItemList === null || menuItemList === void 0 ? void 0 : menuItemList.burger_name)) {
            res.json({
                message: `${req.body.burger_name} already exists in the menu.`
            });
        }
        else {
            yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).insert(menuItemList);
            res.json({
                message: "Burger successfully added to the menu."
            });
        }
    }
    catch (err) {
        next(err);
    }
}));
// Get complete menu
router.get("/getCompleteMenu", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getMenu = yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).find();
    res.json({
        data: getMenu
    });
}));
// Update Menu
router.put("/updateMenu/:id", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findFoodItemToUpdate = yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).findOne({
        where: { id: parseInt(req.params.id) }
    });
    if (findFoodItemToUpdate != null || findFoodItemToUpdate != undefined) {
        yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).merge(findFoodItemToUpdate, req.body);
        yield ormconfig_1.default.getRepository(MenuEntity_1.Menu).save(findFoodItemToUpdate);
        res.json({
            message: `${findFoodItemToUpdate === null || findFoodItemToUpdate === void 0 ? void 0 : findFoodItemToUpdate.burger_name} updated successfully.`
        });
    }
    else {
        res.json({
            error: `${findFoodItemToUpdate.burger_name} could not be updated.`
        });
    }
}));
// Get all live orders
router.get("/getAllLiveOrders", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getAllLiveOrders = yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).find({
        where: { delivery_status: "Live" }
    });
    res.json({
        data: getAllLiveOrders
    });
}));
// Get all completed orders
router.get("/getAllCompletedOrders", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getAllCompletedOrders = yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).find({
        where: { delivery_status: "Completed" }
    });
    res.json({
        data: getAllCompletedOrders
    });
}));
// Get single order to assign
router.get("/getSingleOrderToAssign/:id", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getSingleOrder = yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).findOne({
        where: { id: parseInt(req.params.id) }
    });
    res.json({
        data: getSingleOrder
    });
}));
// Find Delivery Person Available
router.get("/findDeliveryPersonAvailable/:id", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findSingleOrderItem = yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).findOne({
        where: { id: parseInt(req.params.id) }
    });
    const findDeliveryPersonAvailable = yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).find({
        where: { status: "available" }
    });
    // console.log(findSingleOrderItem);
    res.json({
        data: findDeliveryPersonAvailable
        // orderSelected: findSingleOrderItem?.id
    });
}));
// Assign an order to a delivery person who is available
router.post("/assignOrder/:orderID/:deliveryPersonID", adminAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findAvailableDeliveryPerson = yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).findOne({
        where: { id: parseInt(req.params.deliveryPersonID) }
    });
    const findOrder = yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).findOne({
        where: { id: parseInt(req.params.orderID) }
    });
    const findUserFromOrder = yield ormconfig_1.default.getRepository(CustomerEntity_1.Customers).find({
        where: { email: findOrder === null || findOrder === void 0 ? void 0 : findOrder.email }
    });
    const provideAddressAndOrderDetailsToDeliveryPerson = {
        delivery_address: req.body.delivery_address,
        items_to_be_delivered: req.body.items_to_be_delivered,
        status: req.body.status,
        order_id: req.body.order_id
    };
    const updateOrderStatusInTable = {
        delivery_status: "Transit"
    };
    yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).merge(findAvailableDeliveryPerson, provideAddressAndOrderDetailsToDeliveryPerson);
    yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).save(findAvailableDeliveryPerson);
    yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).merge(findOrder, updateOrderStatusInTable);
    yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).save(findOrder);
    res.json({
        message: `Order assigned to delivery person ${findAvailableDeliveryPerson === null || findAvailableDeliveryPerson === void 0 ? void 0 : findAvailableDeliveryPerson.name}`
    });
    let message = {
        to: `${findAvailableDeliveryPerson === null || findAvailableDeliveryPerson === void 0 ? void 0 : findAvailableDeliveryPerson.email}`,
        from: "burpger.dine@gmail.com",
        subject: "New delivery assigned to you!",
        html: `
        <p>
            Hello <b>${findAvailableDeliveryPerson === null || findAvailableDeliveryPerson === void 0 ? void 0 : findAvailableDeliveryPerson.name}</b>, you are assigned a new delivery. 
            <br/>
            Login to your account and see the orders you have been assigned!
        </p>`
    };
    sgMail.send(message)
        .then((response) => {
        console.log(`Email has been sent to customer ${findAvailableDeliveryPerson === null || findAvailableDeliveryPerson === void 0 ? void 0 : findAvailableDeliveryPerson.email}.`);
    });
    // console.log(findUserFromOrder);
}));
exports.default = router;
