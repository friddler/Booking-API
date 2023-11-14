const AWS = require('aws-sdk');
const { sendResponse } = require('../../responses');
const db = new AWS.DynamoDB.DocumentClient();

function roomRules(booking){
    if(booking.roomType == 'double room')
    {
        return 2;
    }
    else if (booking.roomType == 'single room'){
        return 1;
    }
    else if(booking.roomType == 'suit'){
        return 3;
    }
    else{
        return -1;
    }
}
function sumOfBookedRoom(roomType){
    if(roomType == 'double room')
    {
        return 1000;
    }
    else if (roomType == 'single room'){
        return 500;
    }
    else if(roomType == 'suit'){
        return 1500;
    }
    else{
        return -1;
    }
}
function numberOfRooms(roomType){
    if(roomType == 'single room'){
        return 2;
    }
    else{
        return -1;
    }
}



async function countRoomsBooked(dateIn,dateOut){

    const params = {
        TableName: 'room-booking-db',
        FilterExpression: '#dateIn <= :dateOut AND #dateOut >= :dateIn',
        ExpressionAttributeNames: {
            '#dateIn': 'dateIn',
            '#dateOut': 'dateOut'
        },
        ExpressionAttributeValues: {
            ':dateIn': dateIn,
            ':dateOut': dateOut
        }
    };
    
    const result = await db.scan(params).promise();
    return result.Items;
}

exports.handler = async (event,context) => {

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