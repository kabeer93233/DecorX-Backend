import {
  Injectable,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private transport : nodemailer.transport;
        constructor(){
          this.transport = nodemailer.createTransport({
            host : "smtp.gmail.com",
            port : 587,
            secure : false,
            auth:{
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          })
        }

  async sendMessage(dto: ContactDto) {
    await this.transport.sendMail({

      from: `DecorX Contact Form`,

      replyTo: dto.email,

      to: process.env.EMAIL_USER,

      subject: `DecorX | ${dto.subject}`,

      html: `
        <div style="font-family: Arial; padding:20px;">

          <h2>New Contact Message</h2>

          <p>
            <strong>Name:</strong>
            ${dto.firstName} ${dto.lastName}
          </p>

          <p>
            <strong>Email:</strong>
            ${dto.email}
          </p>

          <p>
            <strong>Subject:</strong>
            ${dto.subject}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <div style="background:#f5f5f5; padding:15px; border-radius:8px;">
            ${dto.message}
          </div>

        </div>
      `,
    });

    return {
      message:
        'Message sent successfully',
    };
  }
}