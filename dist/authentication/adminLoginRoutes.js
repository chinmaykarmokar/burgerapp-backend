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
const AdminEntity_1 = require("../Entities/AdminEntity");
const AdminTokenList_1 = require("../Entities/AdminTokenList");
// Using environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwt = require("jsonwebtoken");
// Decrypting password
const bcrypt = require("bcrypt");
const router = express_1.default.Router();
router.post("/adminLogin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const adminExists = yield ormconfig_1.default.getRepository(AdminEntity_1.Admin).find({
        where: { email: req.body.email }
    });
    console.log(adminExists);
    const decryptedPassword = yield bcrypt.compare(req.body.password, ((_a = adminExists[0]) === null || _a === void 0 ? void 0 : _a.password) || " ");
    if (((_b = adminExists[0]) === null || _b === void 0 ? void 0 : _b.email) == req.body.email && decryptedPassword) {
        const adminLoginDetails = {
            email: req.body.email,
            password: req.body.password,
        };
        const accessToken = jwt.sign(adminLoginDetails, process.env.ACCESS_TOKEN);
        yield ormconfig_1.default.getRepository(AdminTokenList_1.AdminTokens).insert({
            email: adminLoginDetails === null || adminLoginDetails === void 0 ? void 0 : adminLoginDetails.email,
            token_issued: accessToken
        });
        res.json({
            message: "Login details stored in database",
            accessToken: accessToken
        });
    }
    else {
        res.json({
            error: `User with the email ${req.body.email} does not exist on our system.`
        });
    }
}));
exports.default = router;
