import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GetUserUseCase } from "src/app/use-cases/user/get-user";
import { HttpStatus } from "src/app/utils/http-status";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";
import connectToMongoDB from "src/infra/config/mongodb";
import { MongoDBUserRepository } from "src/infra/database/mongodb/mongodb-user-repository";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";

const dbConnectionPromise = connectToMongoDB()

async function getUser(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult>{
    winstonAdapter.info("GetUserHandler.getUser", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        authorizer: event.requestContext.authorizer?.lambda?.userId
    })

    await dbConnectionPromise

    const userId = event.requestContext.authorizer?.lambda?.userId

    if (!userId) {
        return {
            statusCode: HttpStatus.UNAUTHORIZED,
            body: JSON.stringify({
                message: "User ID not found in token"
            })
        }
    }

    const userRepository = new MongoDBUserRepository()
    const getUserUseCase = new GetUserUseCase(userRepository, winstonAdapter)

    const user = await getUserUseCase.execute(userId)

    const userPresenter = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }

    return {
        statusCode: HttpStatus.OK,
        body: JSON.stringify({
            data: { user: userPresenter }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(getUser)