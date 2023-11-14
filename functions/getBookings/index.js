const { sendResponse } = require("../../responses/index");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    const params = {
      TableName: "room-booking-db",
    };

    const data = await db.scan(params).promise();
    return sendResponse(200, {success: true, data: data.Items})
  } catch (error) {
    console.error("error fetching bookings", error);
    sendResponse(500, {success: false, message: "cant fetch bookings"})
  }
};
