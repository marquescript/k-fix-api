import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ReportOrganizationUseCase } from "src/app/use-cases/organization/report-organization";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBFailureRepository } from "src/infra/database/mongodb/mongodb-failure-repository";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";

const dbConnectionPromise = connectToMongoDB()

async function reportOrganization(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    winstonAdapter.info("handlers.organization.reportOrganization", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        userId: event.requestContext.authorizer?.lambda?.userId
    })

    const organizationId = event.pathParameters?.organizationId

    if (!organizationId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Organization ID is required"
            })
        }
    }

    await dbConnectionPromise

    const mongodbOrganizationRepository = new MongoDBOrganizationRepository()
    const mongodbFailureRepository = new MongoDBFailureRepository()

    const reportOrganizationUseCase = new ReportOrganizationUseCase(
        mongodbOrganizationRepository,
        mongodbFailureRepository,
        winstonAdapter
    )

    const report = await reportOrganizationUseCase.execute(organizationId)

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { report }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(reportOrganization)