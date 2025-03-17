import { DynamoDBClient, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-east-1" });

export const saveNote = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: "notes",
            Item: {
                name: { S: body.name },
                timestamp: { N: String(Date.now()) },
                data: { S: body.data }
            }
        };

        await dynamo.send(new PutItemCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Note saved successfully" }),
        };
    } catch (error) {
        console.error("Error saving note:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to save note", error }),
        };
    }
};

export const getNotesByName = async (event) => {
    try {
        const name = event.pathParameters.name;

        const params = {
            TableName: "notes",
            KeyConditionExpression: "#pk = :pk_val",
            ExpressionAttributeNames: { "#pk": "name" },
            ExpressionAttributeValues: { ":pk_val": { S: name } }
        };

        const data = await dynamo.send(new QueryCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
        };
    } catch (error) {
        console.error("Error retrieving notes:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve notes", error }),
        };
    }
};
