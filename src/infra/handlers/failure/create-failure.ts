import { APIGatewayProxyResult } from "aws-lambda";
import { CreateFailureUseCase } from "src/app/use-cases/failure/create-failure";
import { CriticalLevel } from "src/domain/@types/enums/critical-level";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBFailureRepository } from "src/infra/database/mongodb/mongodb-failure-repository";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";
import { validationBodyMiddleware } from "src/infra/middlewares/validation-body-middleware";
import { APIGatewayProxyEventWithValidatedBody } from "src/infra/types/api-gateway";
import { z } from "zod";

const createFailureSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    expectedBehavior: z.string().min(1),
    actualBehavior: z.string().min(1),
    tags: z.array(z.string()).min(1),
    criticalLevel: z.nativeEnum(CriticalLevel),
    organizationId: z.string().min(1),
    userCreateId: z.string().min(1)
})

type CreateFailureRequest = z.infer<typeof createFailureSchema>

const dbConnectionPromise = connectToMongoDB()

async function createFailure(
    event: APIGatewayProxyEventWithValidatedBody<CreateFailureRequest>
): Promise<APIGatewayProxyResult> {
    winstonAdapter.info("handlers.failure.createFailure", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        body: {
            title: event.validatedBody.title,
            description: event.validatedBody.description,
            expectedBehavior: event.validatedBody.expectedBehavior,
            actualBehavior: event.validatedBody.actualBehavior,
            tags: event.validatedBody.tags,
            criticalLevel: event.validatedBody.criticalLevel,
            organizationId: event.validatedBody.organizationId,
            userCreateId: event.validatedBody.userCreateId
        }
    })

    await dbConnectionPromise

    const { title, description, expectedBehavior, actualBehavior, tags, criticalLevel, organizationId, userCreateId } = event.validatedBody

    const failureRepository = new MongoDBFailureRepository()
    const organizationRepository = new MongoDBOrganizationRepository()

    const createFailureUseCase = new CreateFailureUseCase(
        failureRepository,
        organizationRepository,
        winstonAdapter
    )

    const failure = await createFailureUseCase.execute({
        title,
        description,
        expectedBehavior,
        actualBehavior,
        tags,
        criticalLevel,
        organizationId,
        userCreateId
    })

    const failurePresenter = {
        id: failure.id,
        title: failure.title,
        description: failure.description,
        expectedBehavior: failure.expectedBehavior,
        actualBehavior: failure.actualBehavior,
        tags: failure.tags,
        criticalLevel: failure.criticalLevel,
        status: failure.status,
        createdAt: failure.createdAt,
        updatedAt: failure.updatedAt
    }

    return {
        statusCode: 201,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { failurePresenter }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(
    validationBodyMiddleware(createFailureSchema, createFailure)
)