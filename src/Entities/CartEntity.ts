import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity ()
export class Cart extends BaseEntity {
    @PrimaryGeneratedColumn ()
        id!: number;

    @Column ()
        email!: string;

    @Column ()
        burger_name!: string;

    @Column ()
        burger_price!: number;

    @Column ({default: 1})
        quantity_of_burger!: number;
}