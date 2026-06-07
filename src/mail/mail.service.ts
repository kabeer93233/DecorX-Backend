import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transport : nodemailer.transport;
      constructor(){
        this.transport = nodemailer.createTransport({
          host : "smtp.gmail.com",
          port : 587,
          secure : false,
          auth:{
            user: "mk1748418@gmail.com",
            pass: "bwma euai dpku fstj"
          }
        })
      }
    async sentOtp(verificationToken:string, to:string){
    const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;
    await this.transport.sendMail({
      from: "mk1748418@gmail.com",
      to: to,
      subject: "OTP from DecoeX",
      html: `
            <h2>Email Verification</h2>

            <p>
            Click below to verify your account
            </p>

            <a href="${verificationLink}">
            Verify Email
            </a>
        `,

    })
  }
}
