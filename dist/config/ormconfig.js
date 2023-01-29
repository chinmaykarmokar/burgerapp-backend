"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
// Using environment variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DATABASE_CREDENTIALS_URI,
    logging: false,
    synchronize: true,
    entities: ["./dist/Entities/**/*.js"],
    extra: {
        ssl: {
            "rejectUnauthorized": false
        }
    }
});
connectDB
    .initialize()
    .then(() => {
    console.log("Data Source has been initialized!");
})
    .catch((err) => {
    console.error("Error during Data Source initialization:", err);
});
exports.default = connectDB;
