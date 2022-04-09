import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity()
export class AdminTokens extends BaseEntity {
    @PrimaryGeneratedColumn()
        id!: number;

    @Column()
        email!: string;

    @Column()
        unique_id!: string;

    @Column()
        token_issued!: string;

    @CreateDateColumn({ type: "timestamptz" })
        token_created_on!: Date;
}