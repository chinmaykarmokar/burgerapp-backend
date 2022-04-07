import { Column, PrimaryGeneratedColumn, Entity, BaseEntity } from "typeorm";

@Entity()
export class Customers extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstname!: string;

    @Column()
    lastname!: string;

    @Column()
    age!: number;

    @Column()
    mobile!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;
}