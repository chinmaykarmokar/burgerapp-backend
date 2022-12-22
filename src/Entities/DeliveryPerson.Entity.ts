import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class DeliveryPerson extends BaseEntity {
    @PrimaryGeneratedColumn ()
        id!: number;

    @Column ()
        name!: string;

    @Column ({type: "bigint"})
        phone!: BigInt;

    @Column ({type: "bigint"})
        aadhar_no!: BigInt; 

    @Column ({unique: true})
        email!: string;
        
    @Column ()
        password!: string; 

    @Column ()
        status!: string;

    @CreateDateColumn ({type: "timestamptz"})
        date_reg_on!: Date;
}