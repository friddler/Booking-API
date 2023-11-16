const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    
    const updatedBooking = JSON.parse(event.body);

    
    if (!updatedBooking.id) {
        return sendResponse(400, { success: false, errorMessage: "Booking ID is required" });
    }

    try {
        
        const updateParams = {
            TableName: 'room-booking-db',
            Key: { id: updatedBooking.id },
            UpdateExpression: "set #name = :n, #email = :email, #dateIn = :din, #dateOut = :dout, #roomType = :rtype, #numberOfGuests = :nguests",
            ExpressionAttributeNames: {
                '#name': 'name',
                '#email': 'email',
                '#dateIn': 'dateIn',
                '#dateOut': 'dateOut',
                '#roomType': 'roomType',
                '#numberOfGuests': 'numberOfGuests'
            },
            ExpressionAttributeValues: {
                ":n": updatedBooking.name,
                ":email": updatedBooking.email,
                ":din": updatedBooking.dateIn,
                ":dout": updatedBooking.dateOut,
                ":rtype": updatedBooking.roomType,
                ":nguests": updatedBooking.numberOfGuests
            },
            ReturnValues: "UPDATED_NEW"
        };

        const result = await db.update(updateParams).promise();

        
        return sendResponse(200, { success: true, updatedBooking: result.Attributes });
    } catch (error) {
        
        return sendResponse(500, { success: false, errorMessage: error.message });
    }
};
