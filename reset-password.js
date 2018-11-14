var builder = require('botbuilder');
var azure = require('azure');

module.exports = (bot) => {
    bot.dialog('reset-password',[
        (session,args,next) => {
            console.log("heree")
            var portalId = builder.EntityRecognizer.findEntity(args.entities, 'portalId') || null;
            var city = builder.EntityRecognizer.findEntity(args.entities, 'city') || null ;
            var contactNumber = builder.EntityRecognizer.findEntity(args.entities, 'portalId') || null;
            var zip = builder.EntityRecognizer.findEntity(args.entities, 'postalCode') || null;
            
            session.dialogData = { portalId, city, contactNumber, zip }
            console.log("dialog data = " +JSON.stringify(session.dialogData));
            
            
            if (!session.dialogData.portalId) {
                console.log("asking for portal ID");
                session.beginDialog('ask-for-portalId');
            }else{
                next()
            }
        },
        
        (session,results,next) => {
            var data = session.dialogData;
            if (results.response){
                data.portalId = results.response.toString().toLowerCase();
            };
            
            if (!data.city){
                session.beginDialog('ask-for-city');
            }else{
                next();
            }     
        },
        
        (session,results,next) => {
            var data = session.dialogData;
            if (results.response){
                data.city = results.response.toString().toLowerCase();
            }
            
            if (!data.contactNumber){
                session.beginDialog('ask-for-contactNumber')
            }else{
                next();
            }
        },
        
        (session, results, next) => {
            var data = session.dialogData;
            if (results.response){
                data.contactNumber = results.response.toString().toLowerCase();
            }
            
            if (!data.contactNumber){
                session.beginDialog('ask-for-zip')
            }else{
                next();
            }
        },
        
        (session, results, next) => {
            var data = session.dialogData;
            if (results.response){
                data.zip = results.response.toString().toLowerCase();
            }
            
            //we have all the data here
            var reset_data = {
                "portal_id": data.portalId,
                "city": data.city,
                "phone": data.contactNumber,
                "zip": data.zip,
                "address": session.message.address
            };
            var serviceBusService = azure.createServiceBusService();
            serviceBusService.sendQueueMessage('graph-requests', JSON.stringify(reset_data), function(error){
                if(!error){
                    console.log("Sent to graph request queue");
                    console.log(data);
                    session.endConversation({
                        text:'Please wait while I validate information and reset your password',
                       sourceEvent:{
                           waitForResponse:true
                       } 
                    });

                }else{
                    console.log(error);
                    session.send({
                       sourceEvent:{
                           applicationError:true
                       } 
                    });
                    session.endDialog();
                }
            });    
        }
    ]).triggerAction({
        matches: 'resetPassword'
    });
    
    bot.dialog('ask-for-portalId', [
        (session) => {
            builder.Prompts.text(session,"What is your portal Id?");
            
        },
        (session,results) => {
            session.endDialogWithResult(results);
        }
    ]);
    
    bot.dialog('ask-for-city', [
        (session) => {
            builder.Prompts.text(session,"Please tell me in which city do you put up?");
            
        },
        (session,results) => {
            session.endDialogWithResult(results);
        }
    ]);
    
    bot.dialog('ask-for-contactNumber', [
        (session) => {
            builder.Prompts.text(session,"Please tell me your contact number.");
            
        },
        (session,results) => {
            session.endDialogWithResult(results);
        }
    ]);
    
    bot.dialog('ask-for-zip', [
        (session) => {
            builder.Prompts.text(session,"Please tell me your contact number.");
            
        },
        (session,results) => {
            session.endDialogWithResult(results);
        }
    ]);
    
    
    
};

