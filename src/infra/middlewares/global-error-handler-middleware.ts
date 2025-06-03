import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Handler } from "aws-lambda";
import { ResourceAlreadyExistsException } from "src/app/exceptions/resource-already-exists";
import { ResourceNotFoundException } from "src/app/exceptions/resource-not-found";
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
        if(context && typeof context.callbackWaitsForEmptyEventLoop !== "undefined") {
            context.callbackWaitsForEmptyEventLoop = false
        }
        try{
            return await handlerFunction(event, context);
        }catch(error: unknown){
            let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
            let message: string = "Internal server error"
            let details: any | undefined = undefined;

            if(error instanceof ResourceNotFoundException){
                statusCode = HttpStatus.NOT_FOUND
                message = error.message
            } else if (error instanceof ZodError){
                statusCode = HttpStatus.BAD_REQUEST
                message = "Invalid request body"
                details = error.flatten().fieldErrors
            } else if (error instanceof ResourceAlreadyExistsException){
                statusCode = HttpStatus.CONFLICT
                message = error.message
            } else {
                console.error(error)
                statusCode = HttpStatus.INTERNAL_SERVER_ERROR
                message = "Internal server error"
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