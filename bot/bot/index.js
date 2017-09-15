var builder = require('botbuilder');

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var DialogLabels = {
    book_room: 'Book a room',
    cancel_booking: 'Cancel room booking',
};

// This is a dinner reservation bot that uses a waterfall technique to prompt users for input.
var luisAppUrl = process.env.LUIS_APP_URL || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/42ffed76-e852-42be-8e20-5b0713187021?subscription-key=77b83fd4f9064cd5a5d926590e435d73';
var bot = new builder.UniversalBot(connector, function (session)
{   
session.send("start");
});

bot.recognizer(new builder.LuisRecognizer(luisAppUrl));

var bookroom = require('./book-room');
bot.dialog('bookrooms', bookroom )
.triggerAction({ 
    matches: 'roombooking',
    confirmPrompt: "This will cancel the creation of the booking you started. Are you sure?" 
});


bot.dialog('begin', [
    function (session) {
        builder.Prompts.choice(
            session,
            'Please enter one of the choice',
            [DialogLabels.book_room, DialogLabels.cancel_booking],
            {
                listStyle : 3,
                maxRetries: 3,
                retryPrompt: 'Not a valid option'
            });
        },
    function (session, result) {
        // on error, start over
        session.on('error', function (err) {
            session.send('Failed with message: %s', err.message);
            session.endDialog();
        });

        // continue on proper dialog
        var selection = result.response.entity;
        switch (selection) {
            case DialogLabels.book_room:
                return session.beginDialog('bookrooms');
                break;
            case DialogLabels.cancel_booking:
                return session.beginDialog('cancel');
                break;
        }   
    }
]);


var cancelroom = require('./cancel-room');
bot.on('error', function (e) {
    console.log('And error ocurred', e);
});

// Enable Conversation Data persistence
bot.set('persistConversationData', true);

// Set default locale
bot.set('localizerSettings', {
    botLocalePath: './bot/locale',
    defaultLocale: 'en'
});



// Trigger secondary dialogs when 'settings' or 'support' is called
bot.use({
    botbuilder: function (session, next) {
        var text = session.message.text;
        var supportRegex = localizedRegex(session, ['help']);

        if (supportRegex.test(text)) {
            // interrupt and trigger 'help' dialog
            //return session.beginDialog('help:/');
        }

        // continue normal flow
        next();
    }
});

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        });
    }
});

var LocalizedRegexCache = {};
function localizedRegex(session, localeKeys) {
    var locale = session.preferredLocale();
    var cacheKey = locale + ":" + localeKeys.join('|');
    if (LocalizedRegexCache.hasOwnProperty(cacheKey)) {
        return LocalizedRegexCache[cacheKey];
    }

    var localizedStrings = localeKeys.map(function (key) { return session.localizer.gettext(locale, key); });
    var regex = new RegExp('^(' + localizedStrings.join('|') + ')', 'i');
    LocalizedRegexCache[cacheKey] = regex;
    return regex;
}

// Connector listener wrapper to capture site url
var connectorListener = connector.listen();
function listen() {
    return function (req, res) {
        connectorListener(req, res);
    };
}

// Other wrapper functions
function beginDialog(address, dialogId, dialogArgs) {
    bot.beginDialog(address, dialogId, dialogArgs);
}

function sendMessage(message) {
    bot.send(message);
}


module.exports = {
    listen: listen,
    beginDialog: beginDialog,
    sendMessage: sendMessage
};