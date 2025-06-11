import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GetFailureUseCase } from "src/app/use-cases/failure/get-failure";
import { HttpStatus } from "src/app/utils/http-status";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBFailureRepository } from "src/infra/database/mongodb/mongodb-failure-repository";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";

const dbConnectionPromise = connectToMongoDB()

async function getFailure(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    winstonAdapter.info("handlers.failure.getFailure", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
    })

    const organizationId = event.pathParameters?.organizationId

    if (!organizationId) {
        return {
            statusCode: HttpStatus.BAD_REQUEST,
            body: JSON.stringify({
                message: "ID of organization not provided"
            })
        }
    }

    const failureId = event.pathParameters?.failureId

    if (!failureId) {
        return {
            statusCode: HttpStatus.BAD_REQUEST,
            body: JSON.stringify({
                message: "ID of failure not provided"
            })
        }
    }

    await dbConnectionPromise

    const failureRepository = new MongoDBFailureRepository()
    const organizationRepository = new MongoDBOrganizationRepository()

    const getFailureUseCase = new GetFailureUseCase(
        failureRepository,
        organizationRepository,
        winstonAdapter
    )

    const failure = await getFailureUseCase.execute(failureId, organizationId)

    const failurePresenter = {
        id: failure.id,
        title: failure.title,
        description: failure.description,
        expectedBehavior: failure.expectedBehavior,
        actualBehavior: failure.actualBehavior,
        tags: failure.tags,
        criticalLevel: failure.criticalLevel,
        status: failure.status,
        userCreateId: failure.userCreateId,
        organizationId: failure.organizationId,
        createdAt: failure.createdAt,
        updatedAt: failure.updatedAt
    }

    return {
        statusCode: HttpStatus.OK,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { failure: failurePresenter }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(getFailure)