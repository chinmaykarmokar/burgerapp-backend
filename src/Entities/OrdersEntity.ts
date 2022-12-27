import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity ()
export class Orders extends BaseEntity {
    @PrimaryGeneratedColumn ()
        id!: number;

    @Column ()
        email!: string;

    @Column ()
        items!: string;

    @Column ()
        price!: number;

    @CreateDateColumn ({type: "timestamptz"})
        order_date!: Date;

    @Column ({default: "Live"})
        delivery_status!: string;
}