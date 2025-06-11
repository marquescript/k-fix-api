
export interface CreateSolutionData {

    failureId: string;
    organizationId: string;
    userCreatedId: string;
    description: string;
    links?: {
        link: string, description: string
    }[];

}