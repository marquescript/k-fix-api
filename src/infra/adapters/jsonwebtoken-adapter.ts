import { AuthenticationProvider } from "src/domain/providers/authentication-provider";
import jwt from "jsonwebtoken";
import { User } from "src/domain/@types/user";
import { env } from "../config/validate-env";

export class JsonWebTokenAdapter implements AuthenticationProvider {

    generateAccessToken(user: User): string {
        const accessTokenExpiresIn = 60 * 60 * 24;
        return jwt.sign({ sub: user.id }, env.JWT_SECRET as string, { expiresIn: accessTokenExpiresIn });
    }

    generateRefreshToken(user: User): string {
        const refreshTokenExpiresIn = 60 * 60 * 24 * 3;
        return jwt.sign({ sub: user.id }, env.JWT_REFRESH_SECRET as string, { expiresIn: refreshTokenExpiresIn });
    }

    verifyAccessToken(token: string): string {
        const decoded = jwt.verify(token, env.JWT_SECRET as string) as { sub: string };
        return decoded.sub;
    }

    verifyRefreshToken(token: string): string {
        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET as string) as { sub: string };
        return decoded.sub;
    }
}