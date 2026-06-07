import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
  ) {}

  @Post()
  sendMessage(@Body() dto: ContactDto) {
    return this.contactService.sendMessage(dto);
  }
}