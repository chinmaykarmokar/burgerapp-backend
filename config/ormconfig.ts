import { DataSource } from "typeorm"

// Using environment variables
import dotenv from "dotenv";
dotenv.config();

const connectDB = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_CREDENTIALS_URI,
    logging: false,
    synchronize: true,
    entities: ["./src/Entities/**/*.ts"],
    extra: {
        ssl: {
            "rejectUnauthorized": false
        }
    }
})

connectDB
        .initialize()
        .then(() => {
            console.log("Data Source has been initialized!")
        })
        .catch((err) => {
            console.error("Error during Data Source initialization:", err)
        });

export default connectDB;