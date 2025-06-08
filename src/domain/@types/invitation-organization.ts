import { InvitationStatus } from "./invitation-status";

export interface InvitationOrganization {

    id?: string;
    token: string;
    guestEmail: string;
    organizationId: string;
    userWhoInvitedId: string;
    status: InvitationStatus;
    expirationDate: Date;
    createdAt?: Date;
    updatedAt?: Date;

}