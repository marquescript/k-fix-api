import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ListSolutionsUseCase } from "src/app/use-cases/solution/list-solutions";
import { HttpStatus } from "src/app/utils/http-status";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBFailureRepository } from "src/infra/database/mongodb/mongodb-failure-repository";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { MongoDBSolutionRepository } from "src/infra/database/mongodb/mongodb-solution-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";

const dbConnectionPromise = connectToMongoDB()

async function listSolutions(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    winstonAdapter.info("handlers.solution.listSolutions", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
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

    const page = Number(event.queryStringParameters?.page) || 1
    const limit = Number(event.queryStringParameters?.limit) || 10

    await dbConnectionPromise

    const solutionRepository = new MongoDBSolutionRepository()
    const organizationRepository = new MongoDBOrganizationRepository()
    const failureRepository = new MongoDBFailureRepository()

    const listSolutionsUseCase = new ListSolutionsUseCase(
        solutionRepository,
        organizationRepository,
        failureRepository,
        winstonAdapter
    )

    const { solutions, total, totalPages } = await listSolutionsUseCase.execute(failureId, organizationId, page, limit)

    const solutionsPresenter = solutions.map((solution) => ({
        id: solution.id,
        description: solution.description,
        links: solution.links?.map((link) => ({
            link: link.link,
            description: link.description
        })),
        userCreatedId: solution.userCreatedId,
        failureId: solution.failureId,
        organizationId: solution.organizationId,
        createdAt: solution.createdAt,
        updatedAt: solution.updatedAt,
    }))

    return {
        statusCode: HttpStatus.OK,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { 
                solutions: solutionsPresenter,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages
                }
            }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(listSolutions)