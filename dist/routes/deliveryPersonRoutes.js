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
const DeliveryPerson_Entity_1 = require("../Entities/DeliveryPerson.Entity");
const OrdersEntity_1 = require("../Entities/OrdersEntity");
// Import authentication middleware
const deliveryPersonAuthMiddleware_1 = __importDefault(require("../middlewares/deliveryPersonAuthMiddleware"));
const typeorm_1 = require("typeorm");
// Parse JSON and use Router
const app = (0, express_1.default)();
app.use(express_1.default.json());
const router = express_1.default.Router();
// Encrypt password
const bcrypt = require("bcrypt");
const salt = 10;
// Import sendgrid
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// Register profile for new delivery person
router.post("/deliveryPersonRegister", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let deliveryPersonPayload = {
            name: req.body.name,
            phone: req.body.phone,
            aadhar_no: req.body.aadhar_no,
            status: req.body.status,
            email: req.body.email,
            password: yield bcrypt.hash(req.body.password, salt)
        };
        const checkIfDeliveryPersonExists = yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).findOne({
            where: { email: req.body.email }
        });
        console.log(checkIfDeliveryPersonExists === null || checkIfDeliveryPersonExists === void 0 ? void 0 : checkIfDeliveryPersonExists.email);
        if ((checkIfDeliveryPersonExists === null || checkIfDeliveryPersonExists === void 0 ? void 0 : checkIfDeliveryPersonExists.email) == (deliveryPersonPayload === null || deliveryPersonPayload === void 0 ? void 0 : deliveryPersonPayload.email)) {
            res.json({
                message: `Delivery Person with the following email ${req.body.email} already exists.`
            });
        }
        else {
            yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).insert(deliveryPersonPayload);
            res.json({
                message: "Delivery Person successfully registered on our platform."
            });
            let message = {
                to: (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.email,
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
// GET data about a single delivery person on authentication
router.get("/deliveryPerson", deliveryPersonAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allDeliveryPersons = yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).find({
        where: { email: req.user.email }
    });
    res.json({
        data: allDeliveryPersons
    });
}));
// Get order assigned to delivery person
router.get("/orderAssigned", deliveryPersonAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findOrdersAssigned = yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).find({
        where: [{ email: req.user.email, order_id: (0, typeorm_1.Not)(0) }]
    });
    if (!findOrdersAssigned) {
        res.json({
            message: "No orders assigned."
        });
    }
    else {
        res.json({
            data: findOrdersAssigned
        });
    }
}));
// Update order status on completion
router.post("/orderCompletion", deliveryPersonAuthMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findDeliveryPerson = yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).findOne({
        where: { email: req.user.email }
    });
    const findOrderToUpdate = yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).findOne({
        where: { id: findDeliveryPerson === null || findDeliveryPerson === void 0 ? void 0 : findDeliveryPerson.order_id }
    });
    const orderUpdateData = {
        status: req.body.status,
        items_to_be_delivered: req.body.items_to_be_delivered,
        delivery_address: req.body.delivery_address,
        order_id: req.body.order_id
    };
    yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).merge(findDeliveryPerson, orderUpdateData);
    yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).save(findDeliveryPerson);
    yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).merge(findOrderToUpdate, { delivery_status: "Completed" });
    yield ormconfig_1.default.getRepository(OrdersEntity_1.Orders).save(findOrderToUpdate);
    res.json({
        message: `Your order was completed successfully by delivery person ${findDeliveryPerson === null || findDeliveryPerson === void 0 ? void 0 : findDeliveryPerson.name}.`
    });
    let message = {
        to: `${findOrderToUpdate === null || findOrderToUpdate === void 0 ? void 0 : findOrderToUpdate.email}`,
        from: "burpger.dine@gmail.com",
        subject: "Your order was successfully delivered!",
        html: `
        <p>
            Hello, thanks for ordering food from Burpger. 
            <br/>
            Your order was completed successfully by delivery person ${findDeliveryPerson === null || findDeliveryPerson === void 0 ? void 0 : findDeliveryPerson.name}.
        </p>`
    };
    sgMail.send(message)
        .then((response) => {
        console.log(`Email has been sent to customer ${req.body.email}.`);
    });
}));
exports.default = router;
