"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const _1 = __importDefault(require("."));
if (cluster_1.default.isPrimary) {
    const cpus = os_1.default.cpus().length;
    console.log(`Forking for ${cpus - 7} CPUs`);
    for (let i = 0; i < cpus - 7; i++) {
        cluster_1.default.fork();
    }
}
else {
    (0, _1.default)();
}
