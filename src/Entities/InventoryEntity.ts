import { Entity, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, Column } from "typeorm";

@Entity ()
export class Inventory extends BaseEntity {
    @PrimaryGeneratedColumn ()
        id!: number;

    @Column ()
        food_item!: string;

    @Column ()
        quantity!: number;

    @CreateDateColumn ()
        inventory_update_date!: Date;
}