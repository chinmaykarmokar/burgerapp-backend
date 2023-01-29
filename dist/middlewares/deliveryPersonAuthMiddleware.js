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
// Import orm config
const ormconfig_1 = __importDefault(require("../config/ormconfig"));
// Import Entity
const DeliveryPersonTokenList_1 = require("../Entities/DeliveryPersonTokenList");
// Import JWT
const jwt = require("jsonwebtoken");
const authenticateDeliveryPersonToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers["authorization"];
    const tokenInUse = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    const currentDeliveryPersonToken = yield ormconfig_1.default.getRepository(DeliveryPersonTokenList_1.DeliveryPersonTokens).findOne({
        where: { token_issued: tokenInUse },
        order: { id: "DESC" }
    });
    console.log("tokenInUse", currentDeliveryPersonToken === null || currentDeliveryPersonToken === void 0 ? void 0 : currentDeliveryPersonToken.id);
    const findLatestTokenCreated = yield ormconfig_1.default.getRepository(DeliveryPersonTokenList_1.DeliveryPersonTokens).findOne({
        where: { email: currentDeliveryPersonToken === null || currentDeliveryPersonToken === void 0 ? void 0 : currentDeliveryPersonToken.email },
        order: { id: "DESC" }
    });
    const timeOfTokenInUse = currentDeliveryPersonToken.token_issue_date.getTime();
    const currentTime = new Date().getTime();
    const tokenValidTime = (Math.round(currentTime - timeOfTokenInUse) / (1000 * 60)).toFixed(2);
    if (tokenInUse == null || tokenInUse == undefined) {
        return res.status(401).json({
            message: "You are not authorized."
        });
    }
    if ((currentDeliveryPersonToken === null || currentDeliveryPersonToken === void 0 ? void 0 : currentDeliveryPersonToken.token_issued) !== (findLatestTokenCreated === null || findLatestTokenCreated === void 0 ? void 0 : findLatestTokenCreated.token_issued) || parseInt(tokenValidTime) >= 10000000) {
        return res.status(401).send({
            message: "Session expired. Please login to continue."
        });
    }
    jwt.verify(tokenInUse, process.env.ACCESS_TOKEN, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403);
        }
        else {
            req.user = user;
            next();
        }
    }));
    console.log(`Token is valid for ${tokenValidTime} minutes.`);
});
exports.default = authenticateDeliveryPersonToken;
