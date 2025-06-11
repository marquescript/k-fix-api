import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GetSolutionUseCase } from "src/app/use-cases/solution/get-solution";
import { HttpStatus } from "src/app/utils/http-status";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { MongoDBSolutionRepository } from "src/infra/database/mongodb/mongodb-solution-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";

const dbConnectionPromise = connectToMongoDB()

async function getSolution(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    winstonAdapter.info("handlers.solution.getSolution", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
    })

    const organizationId = event.pathParameters?.organizationId
    const solutionId = event.pathParameters?.solutionId

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

    if(!solutionId) {
        return {
            statusCode: HttpStatus.BAD_REQUEST,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Solution ID is required"
            })
        }
    }


    await dbConnectionPromise

    const solutionRepository = new MongoDBSolutionRepository()
    const organizationRepository = new MongoDBOrganizationRepository()

    const listSolutionsUseCase = new GetSolutionUseCase(
        solutionRepository,
        organizationRepository,
        winstonAdapter
    )

    const solution = await listSolutionsUseCase.execute(solutionId, organizationId)

    const solutionsPresenter = {
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
    }

    return {
        statusCode: HttpStatus.OK,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { 
                solutions: solutionsPresenter
            }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(getSolution)