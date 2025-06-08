import { InvalidCredentialsException } from "src/app/exceptions/invalid-credentials";
import { AuthenticationProvider } from "src/domain/providers/authentication-provider";
import { EncryptionProvider } from "src/domain/providers/encryption-provider";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { UserRepository } from "src/domain/repository/user-repository";

interface SignInData {
    email: string;
    password: string;
}

interface SignInResponse {
    token: string;
    refreshToken: string;
}

export class SignInUseCase {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly encryptionProvider: EncryptionProvider,
        private readonly authenticationProvider: AuthenticationProvider,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(
        { email, password }: SignInData
    ): Promise<SignInResponse> {
        this.loggerProvider.debug("SignInUseCase.execute", { email, password })

        const user = await this.userRepository.findByEmail(email)

        if(!user) throw new InvalidCredentialsException("Invalid credentials")

        const isPasswordValid = await this.encryptionProvider.compare(password, user.password)

        if(!isPasswordValid) throw new InvalidCredentialsException("Invalid credentials")

        const token = this.authenticationProvider.generateAccessToken(user)
        const refreshToken = this.authenticationProvider.generateRefreshToken(user)

        this.loggerProvider.info("User signed in successfully", 
            { 
                user: { 
                    id:user.id,
                    email: user.email
                } 
            }
        )

        return { token, refreshToken }
    }

}