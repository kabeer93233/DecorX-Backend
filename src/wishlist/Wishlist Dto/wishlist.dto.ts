import { IsNumber }
from 'class-validator';

export class CreateWishlistDTO {

  @IsNumber()

  productId!: number;
}