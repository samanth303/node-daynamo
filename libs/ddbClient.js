const DynamoDBClient = require("aws-sdk")
const REGION = "us-east-1";
const ddbClient = new DynamoDBClient({ region: REGION });
module.exports = ddbClient;