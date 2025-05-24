import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Handler } from "aws-lambda";
import { ResourceNotFound } from "src/app/exceptions/resource-not-found";
import { HttpStatus } from "src/app/utils/http-status";
import { ZodError } from "zod";

type AsyncHandler<TEvent = APIGatewayProxyEvent, TResult = APIGatewayProxyResult> = (
    event: TEvent,
    context: Context
) => Promise<TResult>

export function globalErrorHandlerMiddleware(
    handlerFunction: AsyncHandler
): AsyncHandler {

    return async (event, context): Promise<APIGatewayProxyResult> => {
        try{
            return await handlerFunction(event, context);
        }catch(error: unknown){
            let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
            let message: string = "Internal server error"
            let details: any | undefined = undefined;

            if(error instanceof ResourceNotFound){
                statusCode = HttpStatus.NOT_FOUND
                message = error.message
            } else if (error instanceof ZodError){
                statusCode = HttpStatus.BAD_REQUEST
                message = "Invalid request body"
                details = error.flatten().fieldErrors
            }
            
            const responseBody = {
                message,
                ...(details && { errors: details })
            }

            return {
                statusCode,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(responseBody)
            }
        }
    }
}