import { IsInt, IsNumber, IsString, IsUrl } from "class-validator";

export class CreateProductDTO{
    @IsString()
    productName! : string

    @IsString()
    description! : string

    @IsString()
    category! : string

    @IsInt()
    price! : number

    @IsInt()
    width! : number

    @IsInt()
    height! : number

    @IsUrl()
    image! : string
    
}