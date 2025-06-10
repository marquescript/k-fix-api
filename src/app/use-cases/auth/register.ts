import { ResourceAlreadyExistsException } from "src/app/exceptions/resource-already-exists";
import { Role } from "src/domain/@types/enums/role";
import { User } from "src/domain/@types/user";
import { AuthenticationProvider } from "src/domain/providers/authentication-provider";
import { EncryptionProvider } from "src/domain/providers/encryption-provider";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { UserRepository } from "src/domain/repository/user-repository";

interface RegisterData {
    name: string;
    email: string;
    password: string;
}

interface RegisterResponse {
    token: string;
    refreshToken: string;
}

export class RegisterUseCase {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly encryptionProvider: EncryptionProvider,
        private readonly authenticationProvider: AuthenticationProvider,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(
        { name, email, password }: RegisterData
    ): Promise<RegisterResponse> {
        this.loggerProvider.debug("RegisterUseCase.execute", { name, email, password })

        const emailExists = await this.userRepository.findByEmail(email)

        if(emailExists) throw new ResourceAlreadyExistsException("Email already in use")

        const hashedPassword = await this.encryptionProvider.hash(password)

        const dateNow = new Date()

        const user: User = {
            name,
            email,
            password: hashedPassword,
            role: Role.USER,
            createdAt: dateNow,
            updatedAt: dateNow
        }
        
        const userCreated = await this.userRepository.create(user)

        const token = this.authenticationProvider.generateAccessToken(userCreated)
        const refreshToken = this.authenticationProvider.generateRefreshToken(userCreated)

        this.loggerProvider.info("User registered successfully", 
            { 
                user: {  
                    id: userCreated.id,
                    name: userCreated.name,
                    email: userCreated.email,
                } 
            }
        )

        return { token, refreshToken }
    }

}