import { APIGatewayProxyEvent } from 'aws-lambda';

export interface APIGatewayProxyEventWithValidatedBody<T> extends APIGatewayProxyEvent {
    validatedBody: T;
}