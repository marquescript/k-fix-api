import { APIGatewayProxyResult } from "aws-lambda";
import { SendOrganizationInvitationUseCase } from "src/app/use-cases/organization/send-organization-invitation";
import { HttpStatus } from "src/app/utils/http-status";
import { AWSSESAdapter } from "src/infra/adapters/aws-ses-adapter";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { env } from "src/infra/config/validate-env";
import { MongoDBInvitationOrganizationRepository } from "src/infra/database/mongodb/mongodb-invitation-organization-repository";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { MongoDBUserRepository } from "src/infra/database/mongodb/mongodb-user-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";
import { validationBodyMiddleware } from "src/infra/middlewares/validation-body-middleware";
import { APIGatewayProxyEventWithValidatedBody } from "src/infra/types/api-gateway";
import { z } from "zod";

const sendOrganizationInvitationSchema = z.object({
    organization_id: z.string(),
    user_who_invited_id: z.string(),
    guest_email: z.string(),
    url_redirect: z.string(),
})

type SendOrganizationInvitationRequest = z.infer<typeof sendOrganizationInvitationSchema>

const dbConnectionPromise = connectToMongoDB()

async function sendOrganizationInvitation(
    event: APIGatewayProxyEventWithValidatedBody<SendOrganizationInvitationRequest>
): Promise<APIGatewayProxyResult>{
    winstonAdapter.info("handlers.organization.sendOrganizationInvitation", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        body: { 
            organizationId: event.validatedBody.organization_id,
            userWhoInvitedId: event.validatedBody.user_who_invited_id,
            guestEmail: event.validatedBody.guest_email,
            urlRedirect: event.validatedBody.url_redirect
        }
    })

    await dbConnectionPromise

    const {
        organization_id,
        user_who_invited_id,
        guest_email,
        url_redirect
    } = event.validatedBody

    const mongodbOrganizationRepository = new MongoDBOrganizationRepository()
    const mongodbUserRepository = new MongoDBUserRepository()
    const invitationOrganizationRepository = new MongoDBInvitationOrganizationRepository()
    const awsSesAdapter = new AWSSESAdapter()

    const sendOrganizationInvitationUseCase = new SendOrganizationInvitationUseCase(
        mongodbOrganizationRepository,
        mongodbUserRepository,
        invitationOrganizationRepository,
        awsSesAdapter,
        winstonAdapter
    )

    await sendOrganizationInvitationUseCase.execute({
        organizationId: organization_id,
        userWhoInvitedId: user_who_invited_id,
        guestEmail: guest_email,
        frontendBaseUrl: env.FRONTEND_BASE_URL,
        urlRedirect: url_redirect
    })

    return {
        statusCode: HttpStatus.OK,
        headers: {
            "Content-Type": "application/json"
        },
        body: ""
    }
}

export const handler = globalErrorHandlerMiddleware(
    validationBodyMiddleware(sendOrganizationInvitationSchema, sendOrganizationInvitation)
)