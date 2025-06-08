import { z } from "zod";
import { validationBodyMiddleware } from "../../middlewares/validation-body-middleware";
import { APIGatewayProxyResult, Context } from "aws-lambda";
import { APIGatewayProxyEventWithValidatedBody } from "src/infra/types/api-gateway";
import { HttpStatus } from "src/app/utils/http-status";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";
import { MongoDBUserRepository } from "src/infra/database/mongodb/mongodb-user-repository";
import { BcryptAdapter } from "src/infra/adapters/bcryptjs-adapter";
import { JsonWebTokenAdapter } from "src/infra/adapters/jsonwebtoken-adapter";
import { RegisterUseCase } from "src/app/use-cases/auth/register";
import connectToMongoDB from "src/infra/config/mongodb";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";

const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6)
})

type RegisterInput = z.infer<typeof registerSchema>

const dbConnectionPromise = connectToMongoDB()

async function register(
    event: APIGatewayProxyEventWithValidatedBody<RegisterInput>,
    _: Context
): Promise<APIGatewayProxyResult>{
    winstonAdapter.info("handlers.auth.register", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        body: { 
            name: event.validatedBody.name,
            email: event.validatedBody.email
        }
    })

    await dbConnectionPromise

    const { name, email, password } = event.validatedBody

    const userRepository = new MongoDBUserRepository()
    const encryptionProvider = new BcryptAdapter()
    const authenticationProvider = new JsonWebTokenAdapter()
    const registerUseCase = new RegisterUseCase(
        userRepository, 
        encryptionProvider, 
        authenticationProvider, 
        winstonAdapter
    )

    const { token, refreshToken } = await registerUseCase.execute({name, email, password})

    return {
        statusCode: HttpStatus.CREATED,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { token, refreshToken }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(
    validationBodyMiddleware(registerSchema, register)
)