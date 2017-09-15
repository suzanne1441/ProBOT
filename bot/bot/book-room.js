var builder = require('botbuilder');
function setData(session,args,next)
{
    var intent = args.intent;
    var room = builder.EntityRecognizer.findEntity(intent.entities, 'room');
    var datetime = builder.EntityRecognizer.findEntity(intent.entities, 'builtin.datetimeV2.datetimerange');
    var purpose = builder.EntityRecognizer.findEntity(intent.entities, 'purpose');
    if(room)
    {
        session.dialogData.room = room.entity;
    }
    if(datetime)
    {
        session.dialogData.bookdate = datetime.entity;
    }
    if(purpose)
    {
        session.dialogData.bookingPurpose = purpose.entity;
    }
    next();
}
function roomSelect(session, results, next) {
    
    if(!session.dialogData.room)
    {
        builder.Prompts.choice(session, 'Which room do you want to book?', ['Conf Room 4', 'Conf Room 1', 'Meeting room 3'], {listStyle : 3});
    }
    else
    {
        session.send("Welcome to Room Booking!");
        next();
    }
}

function askForDateTime(session, results,next) {
    if(!session.dialogData.room)
    {
        session.dialogData.room = results.response.entity;
    }

    if(!session.dialogData.bookdate)
    {
        builder.Prompts.time(session, "Please provide a booking date and time (e.g.: June 6th at 6pm)");
    }
    else
    {
        next();
    }
}

function tellPerpose(session, results,next) {
    if(!session.dialogData.bookdate)
    {
        session.dialogData.bookdate = builder.EntityRecognizer.resolveTime([results.response]);
    }

    if(!session.dialogData.bookingPurpose)
    {
        builder.Prompts.text(session, "Please Provide the purpose");
    }
    else
    {
        next();
    }
}

function attendees(session, results,next) {
    if(!session.dialogData.bookingPurpose)
    {
        session.dialogData.bookingPurpose = results.response;
    }

    if(!session.dialogData.attendees)
    {
        builder.Prompts.text(session, "Attendees");
    }
    else
    {
        next();
    }    
}

function confirmation(session, results) {
    if(!session.dialogData.attendees)
    {
        session.dialogData.attendees = results.response;
    }
    session.send(`Room Booking confirmed. Booking details: <br/>Date/Time: ${session.dialogData.bookdate} <br/>Conf room: ${session.dialogData.room} <br/>Purpose of booking: ${session.dialogData.bookingPurpose}`);
    session.endDialog();
}
module.exports = [
    setData,
    roomSelect,
    askForDateTime,
    tellPerpose,
    //attendees,
    confirmation
];