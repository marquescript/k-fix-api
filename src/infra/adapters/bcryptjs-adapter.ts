import { EncryptionProvider } from "src/domain/providers/encryption-provider";
import bcrypt from "bcryptjs"

export class BcryptAdapter implements EncryptionProvider {

    async hash(value: string): Promise<string>{
        return bcrypt.hash(value, 10);
    }

    async compare(value: string, hashedValue: string): Promise<boolean> {
        return bcrypt.compare(value, hashedValue);
    }

}