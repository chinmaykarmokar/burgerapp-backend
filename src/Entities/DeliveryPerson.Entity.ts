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

    @Column ({default: " "})
        delivery_address!: string;

    @Column ({default: " "})
        items_to_be_delivered!: string;

    @Column ({default: 0})
        order_id!: number;
}