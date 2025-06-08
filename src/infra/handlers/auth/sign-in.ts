import { APIGatewayProxyResult, Context } from "aws-lambda";
import { APIGatewayProxyEventWithValidatedBody } from "src/infra/types/api-gateway";
import { z } from "zod";
import { MongoDBUserRepository } from "src/infra/database/mongodb/mongodb-user-repository";
import { BcryptAdapter } from "src/infra/adapters/bcryptjs-adapter";
import { JsonWebTokenAdapter } from "src/infra/adapters/jsonwebtoken-adapter";
import { SignInUseCase } from "src/app/use-cases/auth/sign-in";
import { HttpStatus } from "src/app/utils/http-status";
import { validationBodyMiddleware } from "src/infra/middlewares/validation-body-middleware";
import { globalErrorHandlerMiddleware } from "src/infra/middlewares/global-error-handler-middleware";
import connectToMongoDB from "src/infra/config/mongodb";
import { winstonAdapter } from "src/infra/adapters/winston-adapter";

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

type SignInInput = z.infer<typeof signInSchema>

const dbConnectionPromise = connectToMongoDB()

async function signIn(
    event: APIGatewayProxyEventWithValidatedBody<SignInInput>,
    _: Context
): Promise<APIGatewayProxyResult>{
    winstonAdapter.info("handlers.auth.signIn", {
        method: event.httpMethod,
        url: event.requestContext.domainName + event.requestContext.path,
        body: { email: event.validatedBody.email }
    })

    await dbConnectionPromise

    const { email, password } = event.validatedBody

    const userRepository = new MongoDBUserRepository()
    const encryptionProvider = new BcryptAdapter()
    const authenticationProvider = new JsonWebTokenAdapter()

    const signInUseCase = new SignInUseCase(
        userRepository, 
        encryptionProvider, 
        authenticationProvider, 
        winstonAdapter
    )

    const { token, refreshToken } = await signInUseCase.execute({ email, password })

    return {
        statusCode: HttpStatus.OK,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: { token, refreshToken }
        })
    }
}

export const handler = globalErrorHandlerMiddleware(
    validationBodyMiddleware(signInSchema, signIn)
)