
const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const  db = new AWS.DynamoDB.DocumentClient();




    exports.handler = async (event,context) => {

    try {
          const bookingId = event.pathParameters.id
    
    var params = {
      TableName: 'room-booking-db',
      Key: {
        id :  bookingId
      }
    };
    await db.delete(params).promise()
        
        return sendResponse(200,{succes : true, message : 'deleted booking ${bookingId}' });
    } catch (error) {
        return sendResponse(500, {succes: false, errorMessage : 'error ${error.message}'});
    }
    }
    