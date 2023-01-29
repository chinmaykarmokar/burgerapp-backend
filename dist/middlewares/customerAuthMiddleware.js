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
const CustomerTokenList_1 = require("../Entities/CustomerTokenList");
const ormconfig_1 = __importDefault(require("../config/ormconfig"));
const jwt = require("jsonwebtoken");
const authenticateCustomerToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const authHeader = req.headers["authorization"];
    const tokenInUse = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    const findCustomer = yield ormconfig_1.default.getRepository(CustomerTokenList_1.CustomerTokens).find({
        where: { token_issued: tokenInUse },
        order: { id: "DESC" }
    });
    console.log("tokenInUse", (_a = findCustomer[0]) === null || _a === void 0 ? void 0 : _a.unique_id);
    const latestTokenCreatedByCustomer = yield ormconfig_1.default.getRepository(CustomerTokenList_1.CustomerTokens).find({
        where: { email: (_b = findCustomer[0]) === null || _b === void 0 ? void 0 : _b.email },
        order: { id: "DESC" },
        take: 1
    });
    console.log("latestToken", (_c = latestTokenCreatedByCustomer[0]) === null || _c === void 0 ? void 0 : _c.unique_id);
    const tokenValidTime = Math.abs(new Date().valueOf() - findCustomer[0].token_created_on.valueOf()) / 60000;
    console.log(tokenValidTime);
    if (tokenInUse === null || tokenInUse == undefined) {
        return res.status(403);
    }
    if (((_d = findCustomer[0]) === null || _d === void 0 ? void 0 : _d.unique_id) != ((_e = latestTokenCreatedByCustomer[0]) === null || _e === void 0 ? void 0 : _e.unique_id) || tokenValidTime >= 10000000) {
        return res.status(401).json({
            message: "This token has been invalidated. Your session has experied. Please login again to continue."
        });
    }
    jwt.verify(tokenInUse, process.env.ACCESS_TOKEN, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.status(403);
        }
        else {
            req.user = user;
            next();
        }
    }));
});
exports.default = authenticateCustomerToken;
