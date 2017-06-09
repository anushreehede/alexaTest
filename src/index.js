// exporting the handler to AWS Lambda

exports.handler = function(event, context){
    try{
        // printing the application ID
        console.log("Application id "+event.session.application.applicationId);
        
        // if new session, indicate its beginning
        if(event.session.new){
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }
        
        // capture the type of request made in the session
        if(event.request.type === "LaunchRequest"){
            onLaunch(event.request, event.session, 
                    function callback(sessionAttributes, speechletResponse){
                        context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        } else if(event.request.type === "IntentRequest"){
            onIntent(event.request, event.session,
                    function callback(sessionAttributes, speechletResponse){
                        context.succeed(buildResponse(sessionAttributes, speechletResponse)); 
            });
        } else if(event.request.type === "SesssionEndedRequest"){
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    }
    catch(e){
        context.fail("Exception:" + e);
    }
};

// Call when session starts
function onSessionStarted(sessionStartedRequest, session){
    // session initialization logic 
}

// Call when the user invokes the skill without specifying what they want
function onLaunch(launchRequest, session, callback){
    // session launch logic 
    getWelcomeResponse(callback);
}

// Call when the user specifies an intent for this skill.
function onIntent(intentRequest, session, callback){
    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;
    
    // Check for all the possible intents and handle them individually by creating appropriate handle response functions 
    if(intentName == "WorkXIntent"){
        handleXResponse(intent, session, callback);
    }else if(intentName == "AMAZON.YesIntent"){
        handleYesResponse(intent, session, callback);
    } else if(NoName == "AMAZON.NoIntent"){
        handleNoResponse(intent, session, callback);
    } else if(intentName == "AMAZON.HelpIntent"){
        handleGetHelpRequest(intent, session, callback);
    } else if(intentName == "StopIntent"){
        handleFinishSessionRequest(intent, session, callback);
    } else if(intentName == "AMAZON.CancelIntent"){
        handleFinishSessionRequest(intent, session, callback);
    } else{
        throw "Error";
    }
}

// Call when the user ends the session. Is not called when the skill returns shouldEndSession=true
function onSessionEnded(sessionEndedRequest, session){
    // session end logic 
}

// Welcome response
function getWelcomeResponse(callback){
    // Ensure that session.attributes has been initialized
    //if (!session.attributes) {
    //    session.attributes = {};
    
    var speechOutput = "Welcome! I am Sensei Assistant. Would you like to order coffee or would you like to send an email?";
    var reprompt = "Please tell me what you would like to do. Order coffee or send a email?";
    var header = "Sensei Assistant";
    var shouldEndSession = false;
    
    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    }
    
    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
}

// Handle the request which users wants - coffee or email
function handleXResponse(intent, session, callback){
    var work = intent.slots.Work.value.toLowerCase();
    if(work == "coffee"){
        var speechOutput = "I will get you some coffee";
        var repromptText = "Would you like something else?";
        var header = "Coffee";
    } else if (work == "email"){
        var speechOutput = "I will send an email to example123@gmail.com";
        var repromptText = "Would you like something else?";
        var header = "Email";
    } else {
        var speechOutput = "Sorry, I can't do that for you!";
        var repromptText = "Would you like to order coffee or would you like to send an email?";
        var header = "Can't do that!";
    }
    var shouldEndSession = false;
    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession));
}

// Handle a YES response from user
function handleYesResponse(intent, session, callback){
    var speechOutput = "Would you like to order coffee or would you like to send an email?";
    var repromptText = speechOutput;
    var shouldEndSession = false;
    
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

// Handle a NO response from user
function handleNoResponse(intent, session, callback){
    handleFinishSessionRequest(intent, session, callback);
}

// Handle a get help request
function handleGetHelpRequest(intent, session, callback){
    if (!session.attributes) {
        session.attributes = {};
    }
    var speechOutput = "I can help you out with two things. Ordering coffee and sending an email. ";
    var repromptText = speechOutput;
    var shouldEndSession = false;
    
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

// Handle a finish sesion request
function handleFinishSessionRequest(intent, session, callback){
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}
// Build a speechlet response
function buildSpeechletResponse(title, output, repromptText, shouldEndSession){
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

// Build a speechlet response without the card for the app
function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession){
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}
// Build the complete response
function buildResponse(sessionAttributes, speechletResponse){
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}