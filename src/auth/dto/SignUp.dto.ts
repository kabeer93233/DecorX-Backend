import { IsEmail, IsString, Matches, MinLength } from "class-validator";

export class SignupDTO {
    @IsString()
    fullName! : string;

    @IsEmail()
    email! : string;

    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[0-9])/, {message : " Password must contain 1 special character"})
    password! : string;
}
