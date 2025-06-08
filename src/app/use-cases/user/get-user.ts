import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
import { User } from "src/domain/@types/user";
import { LoggerProvider } from "src/domain/providers/logger-provider";
import { UserRepository } from "src/domain/repository/user-repository";

export class GetUserUseCase {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly loggerProvider: LoggerProvider
    ){}

    async execute(userId: string): Promise<User>{
        this.loggerProvider.debug("GetUserUseCase.execute", { userId })

        const user = await this.userRepository.findById(userId)

        if(!user) throw new ResourceNotFoundException("User not found")

        return user
    }
}