"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryPerson = void 0;
const typeorm_1 = require("typeorm");
let DeliveryPerson = class DeliveryPerson extends typeorm_1.BaseEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DeliveryPerson.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint" }),
    __metadata("design:type", Object)
], DeliveryPerson.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "bigint" }),
    __metadata("design:type", Object)
], DeliveryPerson.prototype, "aadhar_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamptz" }),
    __metadata("design:type", Date)
], DeliveryPerson.prototype, "date_reg_on", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: " " }),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "delivery_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: " " }),
    __metadata("design:type", String)
], DeliveryPerson.prototype, "items_to_be_delivered", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DeliveryPerson.prototype, "order_id", void 0);
DeliveryPerson = __decorate([
    (0, typeorm_1.Entity)()
], DeliveryPerson);
exports.DeliveryPerson = DeliveryPerson;
