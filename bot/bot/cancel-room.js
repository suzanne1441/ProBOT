var builder = require('botbuilder');


module.exports = [
    function (session, results) {
        builder.Prompts.choice(session, 'Which room booking you want to cancel?', ['Conf Room 4', 'Conf Room 1', 'Meeting room 3'], {listStyle : 3});
    },
    function (session, results) {
        session.dialogData.room = results.response.entity;
        builder.Prompts.time(session, "Please provide a booking date and time (e.g.: June 6th at 5pm)");
    },
    function (session, results) {
        session.dialogData.bookdate = builder.EntityRecognizer.resolveTime([results.response]);
        builder.Prompts.text(session, "Okay!Please Provide the purpose");
    },
    function (session, results) {
        session.dialogData.bookingPurpose = results.response;
        session.send("Room Booking cancelled." );
        session.endDialog();
    },
];