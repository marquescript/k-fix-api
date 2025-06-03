import { User } from "../@types/user";

export interface AuthenticationProvider {

    generateAccessToken(user: User): string;
    generateRefreshToken(user: User): string;
    verifyAccessToken(token: string): string;
    verifyRefreshToken(token: string): string;

}
