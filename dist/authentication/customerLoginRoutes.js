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
// Using state variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ormconfig_1 = __importDefault(require("../config/ormconfig"));
// Import Entities
const CustomerEntity_1 = require("../Entities/CustomerEntity");
const CustomerTokenList_1 = require("../Entities/CustomerTokenList");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const router = express_1.default.Router();
const uniqueID = crypto.randomBytes(16).toString("hex");
router.post("/customerLogin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customerExists = yield ormconfig_1.default.getRepository(CustomerEntity_1.Customers).findOne({ where: { email: req.body.email } });
    const decryptedPassword = yield bcrypt.compare(req.body.password, (customerExists === null || customerExists === void 0 ? void 0 : customerExists.password) || " ");
    console.log(decryptedPassword);
    if ((customerExists === null || customerExists === void 0 ? void 0 : customerExists.email) == req.body.email && decryptedPassword) {
        const customerLoginDetails = {
            email: req.body.email,
            password: req.body.password,
            unique_id: uniqueID
        };
        const accessToken = jwt.sign(customerLoginDetails, process.env.ACCESS_TOKEN);
        yield ormconfig_1.default.getRepository(CustomerTokenList_1.CustomerTokens).insert({
            email: customerLoginDetails === null || customerLoginDetails === void 0 ? void 0 : customerLoginDetails.email,
            unique_id: customerLoginDetails === null || customerLoginDetails === void 0 ? void 0 : customerLoginDetails.unique_id,
            token_issued: accessToken
        });
        res.json({
            message: "Login details stored in database.",
            accessToken: accessToken
        });
    }
    else {
        res.json({
            error: `User with the email id ${req.body.email} does not exist on our system.`
        });
    }
}));
exports.default = router;
