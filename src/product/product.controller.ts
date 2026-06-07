import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO } from './product dto/product.dto';
import { Product } from './products.entity';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { storage } from '../cloudinary/cloudinary.storage';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
    constructor(private readonly productService : ProductService){}

    //create Product in Databse
    @UseGuards(AuthGuard)
    @Post('add')
    @UseInterceptors(
    FileInterceptor('image', {
        storage,
    }),
    )
    async addProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDTO: any,
    ): Promise<Product> {
    const imageUrl = file.path;

    createProductDTO.image = imageUrl;

    return this.productService.createProduct(
        createProductDTO,
    );
    }

    //Get All Products
    @Get()
    async getAll() : Promise<Product[]>{
        return this.productService.getAll();
    }

    //Get one by ID
    @UseGuards(AuthGuard)
    @Get(':id')
    async getByID(@Param('id', ParseIntPipe) id : number) : Promise<Product>{
        return this.productService.getById(id);
    }

    //Update Product
    @UseGuards(AuthGuard)
    @Patch(':id')
    async updateProduct(@Param('id') id: number,@Body() body : Partial<Product>) : Promise<Product>{
        return this.productService.updateProduct(id, body);
    }

    //Delete Product
    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteProduct(@Param('id', ParseIntPipe) id : number) : Promise<{message : string}>{
        return this.productService.deleteProduct(id);
    }
}
