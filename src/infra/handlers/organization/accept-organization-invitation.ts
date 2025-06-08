import { APIGatewayProxyResult } from "aws-lambda";
import { AcceptOrganizationInvitationUseCase } from "src/app/use-cases/organization/accept-organization-invitation";
import { HttpStatus } from "src/app/utils/http-status";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBInvitationOrganizationRepository } from "src/infra/database/mongodb/mongodb-invitation-organization-repository";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { MongoDBUserRepository } from "src/infra/database/mongodb/mongodb-user-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";
import { validationBodyMiddleware } from "src/infra/middlewares/validation-body-middleware";
import { APIGatewayProxyEventWithValidatedBody } from "src/infra/types/api-gateway";
import { z } from "zod";

const acceptOrganizationInvitationSchema = z.object({
    token: z.string(),
})

export type AcceptOrganizationInvitationSchema = z.infer<typeof acceptOrganizationInvitationSchema>

const dbConnectionPromise = connectToMongoDB()

async function acceptOrganizationInvitation(
    event: APIGatewayProxyEventWithValidatedBody<AcceptOrganizationInvitationSchema>
): Promise<APIGatewayProxyResult>{
    winstonAdapter.info("handlers.organization.acceptOrganizationInvitation", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        body: { 
            token: event.validatedBody.token,
        }
    })

    await dbConnectionPromise

    const userId = event.requestContext.authorizer?.lambda?.userId

    const { token } = event.validatedBody

    const mongodbInvitationOrganizationRepository = new MongoDBInvitationOrganizationRepository()
    const mongodbOrganizationRepository = new MongoDBOrganizationRepository()
    const mongodbUserRepository = new MongoDBUserRepository()

    const acceptOrganizationInvitationUseCase = new AcceptOrganizationInvitationUseCase(
        mongodbInvitationOrganizationRepository,
        mongodbOrganizationRepository,
        mongodbUserRepository,
        winstonAdapter
    )

    await acceptOrganizationInvitationUseCase.execute({ token, userId })

    return {
        statusCode: HttpStatus.OK,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify("")
    }
}

export const handler = globalErrorHandlerMiddleware(
    validationBodyMiddleware(acceptOrganizationInvitationSchema, acceptOrganizationInvitation)
)