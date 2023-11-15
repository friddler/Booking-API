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
function sumOfBookedRoom(roomType, dateIn, dateOut){

    var Difference_In_Time = dateOut.getTime() - dateIn.getTime(); 
    var Counting_The_Days_From_Time = Difference_In_Time / (1000 * 3600 * 24);

    if(roomType == 'double room')
    {
        return 1000 * Counting_The_Days_From_Time ;
    }
    else if (roomType == 'single room'){
        return 500 * Counting_The_Days_From_Time ;
    }
    else if(roomType == 'suit'){
        return 1500 * Counting_The_Days_From_Time ;
    }
    else{
        return -1;
    }
}
function numberOfRooms(roomType){
    if(roomType == 'single room'){
        return 12;
    }
    else if(roomType == 'double room'){
        return 5;
    }
    else if(roomType == 'suit'){
        return 3;
    }
    else{
        return -1;
    }
}

async function countRoomsBooked(dateIn,dateOut,roomType){

    const params = {
        TableName: 'room-booking-db',
        FilterExpression: '#dateIn <= :dateOut AND #dateOut >= :dateIn AND #roomType = :roomType',
        ExpressionAttributeNames: {
            '#dateIn': 'dateIn',
            '#dateOut': 'dateOut',
            '#roomType': 'roomType'
        },
        ExpressionAttributeValues: {
            ':dateIn': dateIn,
            ':dateOut': dateOut,
            ':roomType': roomType
        }
    };
    
    const result = await db.scan(params).promise();
    return result.Items;
}

exports.handler = async (event,context) => {

    const booking = JSON.parse(event.body);

    const timeStamp = new Date().getTime();
    booking.id = `${timeStamp}`;

    const checkInStamp = new Date(booking.dateIn).getTime();
    const checkOutStamp = new Date(booking.dateOut).getTime();
    if(timeStamp > checkInStamp){ // kolla så att vi inte kan boka bakåt i tiden
        return sendResponse(500, {succes: false, errorMessage : "You cant book a date that doesnt exist!"});
    }

    if(checkInStamp > checkOutStamp){
        return sendResponse(500, {succes: false, errorMessage : "You cant check out before you check in!"});
    }
    
    if(booking.numberOfGuests > roomRules(booking))
    {
        return sendResponse(500, {succes: false, errorMessage : "You cant book in more guests than what the room allows."});
    }
    if(booking.dateIn == booking.dateOut) {
        return sendResponse(500, {succes: false, errorMessage : "you cant book a room for same date, you need to have atleast 1 day seperate"})
    }
    

    try{
        const bookedRooms = await countRoomsBooked(booking.dateIn,booking.dateOut, booking.roomType);

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
            totalCost : sumOfBookedRoom(booking.roomType,new Date(booking.dateIn),new Date(booking.dateOut) ) + " SEK",
            checkInDate : booking.dateIn,
            checkOutDate : booking.dateOut,
            name : booking.name
        }
        return sendResponse(200,{succes : true,  bookingConfirmation : bookingConfirmation});
    } catch (error) {
        return sendResponse(500, {succes: false, errorMessage : error});
    }
}