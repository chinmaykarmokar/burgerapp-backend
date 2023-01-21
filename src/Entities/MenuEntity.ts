import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity ()
export class Menu extends BaseEntity {
    @PrimaryGeneratedColumn ()
        id!: number;

    @Column ()
        burger_name!: string;

    @Column ({default: 2})
        burger_buns_per_burger!: number;

    @Column ({type: "decimal", default: 0.5})
        onions_per_bun!: number;

    @Column ({type: "decimal", default: 0.5})
        tomatoes_per_bun!: number;

    @Column ({default: 1})
        lettuce_per_bun!: number;

    @Column ()
        chicken_patty!: number;

    @Column ()
        paneer_patty!: number;

    @Column ()
        cheese!: number;

    @Column ()
        category!: string;

    @Column ()
        price!: number;

    @Column ({nullable: true})
        burger_image!: string;
}