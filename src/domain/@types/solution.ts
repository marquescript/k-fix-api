
export interface Solution {

    id?: string;
    failureId: string;
    organizationId: string;
    userCreatedId: string;
    description: string;
    links?: {
        link: string, description: string
    }[];
    createdAt?: Date;
    updatedAt?: Date;

}