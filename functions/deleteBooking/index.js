
const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();




    exports.handler = async (event,context) => {

        var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    
    
    
    var params = {
      TableName: 'TABLE',
      Key: {
        id : {S: '1699954341065'}
      }
    };
    
    ddb.deleteItem(params, function(err, data) {
      if (err) {
        console.log("Error kunde inte radera bokningen", err);
      } else {
        console.log("Bokningen är raderad", data);
      }
    });

    try{
        
        return sendResponse(200,{succes : true,  bookingConfirmation : bookingConfirmation});
    } catch (error) {
        return sendResponse(500, {succes: false, errorMessage : error});
    }
    }