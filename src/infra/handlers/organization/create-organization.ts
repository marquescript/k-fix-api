import { APIGatewayProxyResult } from "aws-lambda";
import { CreateOrganizationUseCase } from "src/app/use-cases/organization/create-organization";
import { HttpStatus } from "src/app/utils/http-status";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { MongoDBUserRepository } from "src/infra/database/mongodb/mongodb-user-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";
import { validationBodyMiddleware } from "src/infra/middlewares/validation-body-middleware";
import { APIGatewayProxyEventWithValidatedBody } from "src/infra/types/api-gateway";
import { z } from "zod";

const createOrganizationSchema = z.object({
    owner_id: z.string(),
    name: z.string()
})

type CreateOrganizationRequest = z.infer<typeof createOrganizationSchema>

const dbConnectionPromise = connectToMongoDB()

async function createOrganization(
    event: APIGatewayProxyEventWithValidatedBody<CreateOrganizationRequest>
): Promise<APIGatewayProxyResult> {
    winstonAdapter.info("handlers.organization.createOrganization", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        body: { 
            ownerId: event.validatedBody.owner_id,
            name: event.validatedBody.name
        }
    })

    await dbConnectionPromise

    const { owner_id, name } = event.validatedBody

    const organizationRepository = new MongoDBOrganizationRepository()
    const userRepository = new MongoDBUserRepository()
    const createOrganizationUseCase = new CreateOrganizationUseCase(
        organizationRepository,
        userRepository,
        winstonAdapter
    )

    const organization = await createOrganizationUseCase.execute({
        name,
        ownerId: owner_id
    })

    const organizationPresenter = {
        id: organization.id,
        name: organization.name,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt
    }

    return {
        statusCode: HttpStatus.CREATED,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { organization: organizationPresenter }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(
    validationBodyMiddleware(createOrganizationSchema, createOrganization)
)