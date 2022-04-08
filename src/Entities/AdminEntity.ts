import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Admin extends BaseEntity {
    @PrimaryGeneratedColumn()
        id!: number;

    @Column()
        firstname!: string;

    @Column()    
        lastname!: string;

    @Column()    
        email!: string;

    @Column()
        mobile!: number;    

    @Column()    
        password!: string;
}