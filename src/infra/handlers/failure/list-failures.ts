import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ListFailuresUseCase } from "src/app/use-cases/failure/list-failures";
import { CriticalLevel } from "src/domain/@types/enums/critical-level";
import { FailureStatus } from "src/domain/@types/enums/failure-status";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBFailureRepository } from "src/infra/database/mongodb/mongodb-failure-repository";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { APIGatewayProxyEventWithValidatedBody } from "src/infra/types/api-gateway";
import { z } from "zod";

const listFailureSchema = z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    title: z.string().optional(),
    status: z.nativeEnum(FailureStatus).optional(),
    criticalLevel: z.nativeEnum(CriticalLevel).optional(),
    tags: z.array(z.string()).optional(),
    createdAt: z.date().optional(),
})

type ListFailuresRequest = z.infer<typeof listFailureSchema>

const dbConnectionPromise = connectToMongoDB()

async function listFailures(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    winstonAdapter.info("handlers.failure.listFailures", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
    })

    const organizationId = event.pathParameters?.organizationId

    if (!organizationId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "ID of organization not provided"
            })
        }
    }

    const queryParams = event.queryStringParameters || {}
    const validatedParams = listFailureSchema.parse({
        page: queryParams.page ? Number(queryParams.page) : undefined,
        limit: queryParams.limit ? Number(queryParams.limit) : undefined,
        title: queryParams.title,
        status: queryParams.status as FailureStatus,
        criticalLevel: queryParams.criticalLevel as CriticalLevel,
        tags: queryParams.tags ? queryParams.tags.split(',') : undefined,
        createdAt: queryParams.createdAt ? new Date(queryParams.createdAt) : undefined
    })

    await dbConnectionPromise

    const failureRepository = new MongoDBFailureRepository()
    const organizationRepository = new MongoDBOrganizationRepository()

    const listFailuresUseCase = new ListFailuresUseCase(
        failureRepository,
        organizationRepository,
        winstonAdapter
    )

    const failures = await listFailuresUseCase.execute({
        organizationId,
        pagination: {
            page: validatedParams.page,
            limit: validatedParams.limit
        },
        params: {
            title: validatedParams.title,
            status: validatedParams.status,
            criticalLevel: validatedParams.criticalLevel,
            tags: validatedParams.tags,
            createdAt: validatedParams.createdAt
        }
    })

    const failuresPresenter = failures.map(failure => {
        return {
            id: failure.id,
            title: failure.title,
            description: failure.description,
            expectedBehavior: failure.expectedBehavior,
            actualBehavior: failure.actualBehavior,
            status: failure.status,
            criticalLevel: failure.criticalLevel,
            tags: failure.tags,
            organizationId: failure.organizationId,
            userCreateId: failure.userCreateId,
            createdAt: failure.createdAt,
            updatedAt: failure.updatedAt
        }
    })

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { failures: failuresPresenter },
            meta: { total_count: failures.length }
        })
    }
}

export const handler = listFailures