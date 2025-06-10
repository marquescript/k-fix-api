import { OrganizationRepository } from "src/domain/repository/organization-repository";
import OrganizationModel, { OrganizationDocument } from "./schemas/organization";
import { Model } from "mongoose";
import { Organization } from "src/domain/@types/organization";
import UserOrganizationModel, { UserOrganizationDocument } from "./schemas/user-organization";
import mongoose from "mongoose";
import { User } from "src/domain/@types/user";
import { InvitationOrganization } from "src/domain/@types/invitation-organization";
import InvitationOrganizationModel, { InvitationOrganizationDocument } from "./schemas/invitation-organization";
import { InvitationStatus } from "src/domain/@types/enums/invitation-status";

export class MongoDBOrganizationRepository implements OrganizationRepository {

    private readonly organization: Model<OrganizationDocument>
    private readonly userOrganization: Model<UserOrganizationDocument>
    private readonly invitationOrganization: Model<InvitationOrganizationDocument>

    constructor(){
        this.organization = OrganizationModel
        this.userOrganization = UserOrganizationModel
        this.invitationOrganization = InvitationOrganizationModel
    }

    async create(organization: Organization): Promise<Organization> {
        const session = await mongoose.startSession()
        
        try {
            session.startTransaction()
            
            const [newOrganization] = await this.organization.create([organization], { session })
            
            const userOrganization: UserOrganizationDocument = {
                userId: organization.ownerId,
                organizationId: newOrganization.id,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            
            await this.userOrganization.create([userOrganization], { session })
            
            await session.commitTransaction()
            return newOrganization
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    async findById(id: string): Promise<Organization | null> {
        return await this.organization.findById(id).lean()
    }

    async findUserExistsInOrganization(userId: string, organizationId: string): Promise<boolean> {
        const userOrganization =  await this.userOrganization.findOne({
            userId, 
            organizationId
        }).lean()
        return !!userOrganization
    }

    async addUserToOrganization(invitationOrganization: InvitationOrganization, user: User): Promise<void> {
        const session = await mongoose.startSession()

        try{
            session.startTransaction()

            const userOrganization: UserOrganizationDocument = {
                userId: user.id!,
                organizationId: invitationOrganization.organizationId,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            
            await this.userOrganization.create([userOrganization], { session })

            await this.invitationOrganization.updateOne(
                { id: invitationOrganization.id }, 
                { $set: { status: InvitationStatus.ACCEPTED } },
                { session }
            )

            await session.commitTransaction()
        } catch(error){
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    async findUserOrganizations(userId: string): Promise<Organization[]> {
        const userOrganizations = await this.userOrganization.find({ userId })
        const organizationIds = userOrganizations.map(org => org.organizationId)
        if(organizationIds.length === 0) return []
        const organizations = await this.organization.find({ _id: { $in: organizationIds } }).lean()
        return organizations.map(org => ({
            ...org,
            id: org._id.toString()
        }))
    }

}