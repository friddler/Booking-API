
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

        const booking = JSON.parse(event.body);
    
        const timeStamp = new Date().getTime();
    
        booking.id = `${timeStamp}`;
        
        if(booking.numberOfGuests > roomRules(booking))
        {
            return sendResponse(500, {succes: false, errorMessage : "Du har fler gäster än rum"});
        }
        
        
    
        try{
            const bookedRooms = await countRoomsBooked(booking.dateIn,booking.dateOut);
    
            if(bookedRooms.length >= numberOfRooms(booking.roomType)){
                return sendResponse(500, {succes: false, message : "There is no " + booking.roomType + " available!"});
            }
            await db.put({
                TableName: 'room-booking-db',
                Item: booking
            }).promise();
    
            const bookingConfirmation = {
                bookingNumber : booking.id,
                numberOfGuests : booking.numberOfGuests,
                totalCost : sumOfBookedRoom(booking.roomType) + " SEK",
                checkInDate : booking.dateIn,
                checkOutDate : booking.dateOut,
                bookerName : booking.name
                
            }
            return sendResponse(200,{succes : true,  bookingConfirmation : bookingConfirmation});
        } catch (error) {
            return sendResponse(500, {succes: false, errorMessage : error});
        }
    }