import { ZodSchema, z } from "zod";
import { APIGatewayProxyEventWithValidatedBody } from "../types/api-gateway";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context, Handler } from "aws-lambda";
import { HttpStatus } from "src/app/utils/http-status";

type ValidatedHandler<S extends ZodSchema> = (
    event: APIGatewayProxyEventWithValidatedBody<z.infer<S>>,
    context: Context
) => Promise<APIGatewayProxyResult>;

type MiddlewareWrappedHandler = (
    event: APIGatewayProxyEvent,
    context: Context
) => Promise<APIGatewayProxyResult>

export function validationBodyMiddleware<S extends ZodSchema>(
    schema: S,
    handlerFunction: ValidatedHandler<S>
): MiddlewareWrappedHandler{

    return async (event, context): Promise<APIGatewayProxyResult> => {
        if(!event.body){
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Body is required"
                })
            }
        }

        let requestBody;
        try{
            requestBody = JSON.parse(event.body)
        }catch(error){
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Invalid request body"
                })
            }
        }

        const validationResult = schema.safeParse(requestBody)
        if(!validationResult.success){
            throw validationResult.error
        }

        const eventWithValidatedBody = event as APIGatewayProxyEventWithValidatedBody<z.infer<S>>
        eventWithValidatedBody.validatedBody = validationResult.data

        return handlerFunction(eventWithValidatedBody, context)
    }
}