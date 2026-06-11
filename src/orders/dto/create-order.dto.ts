import {
  IsArray,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateOrderDto {

  @IsString()
  fullName!: string;

  @IsString()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  postalCode!: string;

  @IsNumber()
  total!: number;

  @IsString()
  paymentMethod!: string;

  @IsArray()
  items!: {

    productId: number;

    name: string;

    image: string;

    quantity: number;

    price: number;

  }[];
}