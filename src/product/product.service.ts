import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Repository } from 'typeorm';
import { CreateProductDTO } from './product dto/product.dto';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepository : Repository<Product>,
    ){}

    async createProduct(createProductDTO: CreateProductDTO ) : Promise<Product>{
        const product = await this.productRepository.create(createProductDTO);
        return this.productRepository.save(product);
    }

    async getAll() : Promise<Product[]>{
        return this.productRepository.find();
    }

    async getById(id : number) : Promise<Product> {
        const product = await this.productRepository.findOneBy({id});
        if(!product){
            throw new NotFoundException(`Product Not Found with given id : ${id}`);
        }
        return product
    }

    async updateProduct(id : number, updateData: Partial<Product>) : Promise<Product>{
        const product =await this.productRepository.findOneBy({id});
        if(!product){
            throw new NotFoundException(`Product Not Found with given id : ${id}`);
        }
        const updatedProduct = Object.assign(product, updateData);
        return this.productRepository.save(updatedProduct);
    }

    async deleteProduct(id : number) : Promise<{message : string}>{
        const result =await  this.productRepository.delete(id);
        if(result.affected === 0){
            throw new NotFoundException('Product with this ID not found.');
        }
        return {message : `Product with ID ${id} is deleted successfully`};
    }
}
