import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn  } from "typeorm";

@Entity() 
export class DeliveryPersonTokens extends BaseEntity {
    @PrimaryGeneratedColumn()
        id!: number;

    @Column()
        email!: string;

    @Column()
        token_issued!: string;

    @CreateDateColumn({type: "timestamptz"})
        token_issue_date!: Date;
}