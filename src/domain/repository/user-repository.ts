import { User } from "src/domain/@types/user";

export interface UserRepository {

    create(user: User): Promise<User>
    findByEmail(email: string): Promise<User | null>
    findById(id: string): Promise<User | null>

}