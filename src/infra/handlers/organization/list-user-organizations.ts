import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ListUserOrganizationsUseCase } from "src/app/use-cases/organization/list-user-organizations";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBFailureRepository } from "src/infra/database/mongodb/mongodb-failure-repository";
import { MongoDBOrganizationRepository } from "src/infra/database/mongodb/mongodb-organization-repository";
import { MongoDBUserRepository } from "src/infra/database/mongodb/mongodb-user-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";

const dbConnectionPromise = connectToMongoDB()

async function listUserOrganizations(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    winstonAdapter.info("handlers.organization.listUserOrganizations", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        userId: event.requestContext.authorizer?.lambda?.userId
    })

    const userId = event.requestContext.authorizer?.lambda?.userId

    await dbConnectionPromise

    const mongodbOrganizationRepository = new MongoDBOrganizationRepository()
    const mongodbUserRepository = new MongoDBUserRepository()
    const mongodbFailureRepository = new MongoDBFailureRepository()

    const listUserOrganizationsUseCase = new ListUserOrganizationsUseCase(
        mongodbOrganizationRepository,
        mongodbUserRepository,
        mongodbFailureRepository,
        winstonAdapter
    )

    const userOrganizations = await listUserOrganizationsUseCase.execute(userId)

    const userOrganizationsPresenter = userOrganizations.map(org => {
        return {
            id: org.id,
            name: org.name,
            failures_count: org.failuresCount,
            members_count: org.membersCount
        }
    })

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { 
                organizations: userOrganizationsPresenter 
            },
            meta: {
                total_count: userOrganizations.length
            }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(listUserOrganizations)