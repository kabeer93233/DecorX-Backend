import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class Product{
    @PrimaryGeneratedColumn()
    id! : number

    @Column()
    productName! : string

    @Column()
    description! : string

    @Column()
    category! : string

    @Column()
    price! : number

    @Column()
    width! : number
    
    @Column()
    height! : number

    @Column()
    image! : string
}