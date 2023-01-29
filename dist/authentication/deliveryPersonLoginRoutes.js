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
// Using environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import config file
const ormconfig_1 = __importDefault(require("../config/ormconfig"));
// Import Entities
const DeliveryPerson_Entity_1 = require("../Entities/DeliveryPerson.Entity");
const DeliveryPersonTokenList_1 = require("../Entities/DeliveryPersonTokenList");
// Pre-requisites
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express_1.default.Router();
router.post("/deliveryLogin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const checkIfDeliveryPersonExists = yield ormconfig_1.default.getRepository(DeliveryPerson_Entity_1.DeliveryPerson).findOne({
        where: { email: req.body.email }
    });
    const decryptedPassword = yield bcrypt.compare(req.body.password, (checkIfDeliveryPersonExists === null || checkIfDeliveryPersonExists === void 0 ? void 0 : checkIfDeliveryPersonExists.password) || 0);
    console.log(decryptedPassword);
    if ((checkIfDeliveryPersonExists === null || checkIfDeliveryPersonExists === void 0 ? void 0 : checkIfDeliveryPersonExists.email) == req.body.email && decryptedPassword) {
        const deliveryLoginCredentials = {
            email: req.body.email,
            password: req.body.password,
        };
        const accessToken = jwt.sign(deliveryLoginCredentials, process.env.ACCESS_TOKEN);
        yield ormconfig_1.default.getRepository(DeliveryPersonTokenList_1.DeliveryPersonTokens).insert({
            email: deliveryLoginCredentials === null || deliveryLoginCredentials === void 0 ? void 0 : deliveryLoginCredentials.email,
            token_issued: accessToken
        });
        res.json({
            message: "Login session details successfully stored in database.",
            accessToken: accessToken
        });
    }
    else {
        res.json({
            message: "Login unsucessful. Incorrect credentials provided that do not exist on our system."
        });
    }
}));
exports.default = router;
