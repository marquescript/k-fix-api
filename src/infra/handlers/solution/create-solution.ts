import { APIGatewayProxyResult } from "aws-lambda";
import { CreateSolutionUseCase } from "src/app/use-cases/solution/create-solution";
import { HttpStatus } from "src/app/utils/http-status";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBFailureRepository } from "src/infra/database/mongodb/mongodb-failure-repository";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { MongoDBSolutionRepository } from "src/infra/database/mongodb/mongodb-solution-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";
import { validationBodyMiddleware } from "src/infra/middlewares/validation-body-middleware";
import { APIGatewayProxyEventWithValidatedBody } from "src/infra/types/api-gateway";
import { z } from "zod";

const createSolutionSchema = z.object({
    userCreatedId: z.string().min(1),
    description: z.string().min(1),
    links: z.array(z.object({
        link: z.string(),
        description: z.string()
    })).optional()
})

type CreateSolutionSchema = z.infer<typeof createSolutionSchema>

const dbConnectionPromise = connectToMongoDB()

async function createSolution(
    event: APIGatewayProxyEventWithValidatedBody<CreateSolutionSchema>
): Promise<APIGatewayProxyResult> {
    winstonAdapter.info("handlers.solution.createSolution", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        body: {
            failureId: event.pathParameters?.failureId,
            organizationId: event.pathParameters?.organizationId,
            userCreatedId: event.validatedBody.userCreatedId,
            description: event.validatedBody.description,
            links: event.validatedBody.links
        }
    })

    const organizationId = event.pathParameters?.organizationId
    const failureId = event.pathParameters?.failureId

    if(!organizationId) {
        return {
            statusCode: HttpStatus.BAD_REQUEST,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Organization ID is required"
            })
        }
    }

    if(!failureId) {
        return {
            statusCode: HttpStatus.BAD_REQUEST,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Failure ID is required"
            })
        }
    }

    await dbConnectionPromise

    const solutionRepository = new MongoDBSolutionRepository()
    const failureRepository = new MongoDBFailureRepository()
    const organizationRepository = new MongoDBOrganizationRepository()

    const createSolutionUseCase = new CreateSolutionUseCase(
        solutionRepository,
        failureRepository,
        organizationRepository,
        winstonAdapter
    )

    const solution = await createSolutionUseCase.execute({
        failureId,
        organizationId,
        userCreatedId: event.validatedBody.userCreatedId,
        description: event.validatedBody.description,
        links: event.validatedBody.links
    })

    const solutionPresenter = {
        id: solution.id,
        failur_iId: solution.failureId,
        organization_id: solution.organizationId,
        user_created_id: solution.userCreatedId,
        description: solution.description,
        links: solution.links?.map((link) => ({
            link: link.link,
            description: link.description
        })),
        created_at: solution.createdAt,
        updated_at: solution.updatedAt
    }

    return {
        statusCode: HttpStatus.CREATED,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { solution: solutionPresenter }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(
    validationBodyMiddleware(createSolutionSchema, createSolution)
)