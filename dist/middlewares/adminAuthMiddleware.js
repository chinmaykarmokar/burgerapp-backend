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
const AdminTokenList_1 = require("../Entities/AdminTokenList");
const ormconfig_1 = __importDefault(require("../config/ormconfig"));
const jwt = require("jsonwebtoken");
// Using environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateAdminToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers["authorization"];
    const tokenInUse = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    const findAdmin = yield ormconfig_1.default.getRepository(AdminTokenList_1.AdminTokens).findOne({
        where: { token_issued: tokenInUse },
        order: { id: "DESC" }
    });
    const latestTokenCreatedByAdmin = yield ormconfig_1.default.getRepository(AdminTokenList_1.AdminTokens).findOne({
        where: { email: findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin.email },
        order: { id: "DESC" }
    });
    // console.log("latestToken", latestTokenCreatedByAdmin?.unique_id);
    const tokenValidTime = Math.abs(new Date().getTime() - findAdmin.token_created_on.getTime()) / 60000;
    console.log(tokenValidTime);
    if (tokenInUse === null || tokenInUse == undefined) {
        return res.status(403);
    }
    if ((findAdmin === null || findAdmin === void 0 ? void 0 : findAdmin.token_issued) != (latestTokenCreatedByAdmin === null || latestTokenCreatedByAdmin === void 0 ? void 0 : latestTokenCreatedByAdmin.token_issued) || tokenValidTime >= 100000) {
        return res.status(401).json({
            message: "Session experied. Please login to continue."
        });
    }
    jwt.verify(tokenInUse, process.env.ACCESS_TOKEN, (err, user) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403);
        }
        else {
            res.user = user;
            next();
        }
    }));
});
exports.default = authenticateAdminToken;
