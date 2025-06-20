import { Role } from "./enums/role";

export interface User {

    id?: string;
    name: string;
    email: string;
    password: string;
    role: Role;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;

}