'use strict';

import { App as HomeyApp } from "homey";
import { Settings as AppSettings } from "../src/settings";
import { FlowCardTrigger, FlowCardAction, FlowToken, ManagerFlow } from "homey";
import { Token, Schedule } from "./containerclasses";
import { Trigger } from "./triggerhandler";
import { timeStamp } from "console";

class TokenWrapper{
    constructor(flowtoken:FlowToken, token:Token) {
        this.flowtoken=flowtoken;
        this.token=token;
    }
    flowtoken:FlowToken;
    token:Token;
}

export class FlowAndTokenHandler {
    private homeyApp:HomeyApp;
    private settings:AppSettings;
    private tokenwrappers:TokenWrapper[];
    
    constructor(homeyApp:HomeyApp, settings:AppSettings) {
        this.homeyApp=homeyApp;
        this.settings=settings;
    }

    setupFlows() {
        this.homeyApp.log('Setting upp Flows');

        try {
            let myTrigger = new FlowCardTrigger('schedule_trigger');

            //Needed?
            myTrigger.register();
            let myTriggerMyArg = myTrigger.getArgument('schedule');
            myTriggerMyArg.registerAutocompleteListener( ( query, args ) => {
               
                let results = this.settings.schedules;
//                this.homeyApp.log(results);
                results = results.filter( result => {
                    return result.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
                });
                return Promise.resolve( results );
            }); 
        
            myTrigger.registerRunListener(async ( args, state:Trigger ) => {
                let shalltrigger = true;
              
                //this.homeyApp.log('Trigger Run');
                let s = <Schedule>args.schedule;
                shalltrigger = s.id===state.schedule.id;
                this.homeyApp.log('Will trigger: ' + shalltrigger + ', schedule: ' + s.name);
                return Promise.resolve( shalltrigger );
          
            })
        
            let myAction = new FlowCardAction('change_schedule_state');
              
            //Needed?
            myAction.register();
            let myActionMyArg = myAction.getArgument('schedule');
            myActionMyArg.registerAutocompleteListener( ( query, args ) => {
              let results = this.settings.schedules.map(x=>x.name);
              results = results.filter( result => {
              return result.toLowerCase().indexOf( query.toLowerCase() ) > -1;
              });
              return Promise.resolve( results );
            }); 
                
        } catch (error) {
            this.homeyApp.log('Not able to setup Flows! Error: ' + error);
        }

        this.homeyApp.log('Setting up Flows done');
    }

    setupTokens() {
        this.homeyApp.log('Setting up Tokens');

        try {
            //This routine can be run when reinitialized. Therefore we must remove any old intances of tokens.
            if (this.tokenwrappers==null) {
                this.tokenwrappers = new Array();    
            }
            let mf = ManagerFlow;
            let ps:Promise<any>[] = new Array();
            this.tokenwrappers.forEach(tw => {
                this.homeyApp.log('Unregistering token with id: ' + tw.token.id + ", name: " + tw.token.name);
                
                //let pr = new Promise
                let promise = tw.flowtoken.unregister();
                ps.push(promise);
                //mf.unregisterToken(tw.flowtoken);  
                this.homeyApp.log('Unregistered token with id: ' + tw.token.id + ", name: " + tw.token.name);
            })
            Promise.all(ps).then(() => {
                this.homeyApp.log('All tokens unregged')

                this.tokenwrappers = new Array();
                this.settings.schedules.forEach(schedule => {
                    schedule.tokens.forEach(token => {
    
                        let myToken = new FlowToken('schedule' + schedule.id + '-token' + token.id, {
                        type: token.type,
                        title: schedule.name + ' - ' + token.name
                        })


                        this.tokenwrappers.push(new TokenWrapper(myToken,token));
                        let promise = myToken.register()
                            .catch(e => {console.log('Error registering token: ' + token.id + ', ' + token.name )});
                        this.homeyApp.log('Registered token with id: ' + token.id + ", name: " + token.name);
                //     promise.then(()=>{
                //             if (token.type == 'boolean') this.setTokenValue(token,false);
                //             else if (token.type == 'string') this.setTokenValue(token,'Not set');
                //             else if (token.type == 'number') this.setTokenValue(token,0);
                //      })
                    })
                    
                });
                    
            })
    
        } catch (error) {
            this.homeyApp.log('Not able to setup Tokens! Error: ' + error);
        }

        this.homeyApp.log('Setting up Tokens done');
    }

    setTokenValue(token:Token, value:any) {
        let ftw:TokenWrapper;

        //this.homeyApp.log('Looking for token: ' + token.name + ', with id: ' + token.id);
        //this.homeyApp.log('in list with ' + this.tokenwrappers.length + ' elements.');
        //this.homeyApp.log(this.tokenwrappers);

        ftw = this.tokenwrappers.find(tw=>tw.token.id == token.id);
        if (ftw != null) {
            let t = ftw.token;
            let ft = ftw.flowtoken;
            if (t.type == 'boolean') ft.setValue(Boolean(value));
            else if (t.type == 'string') ft.setValue(String(value));
            else if (t.type == 'number') ft.setValue(Number(value));
            this.homeyApp.log('Token: ' + t.name + ', value set to: ' + value);
        }
        else{
            this.homeyApp.log('No tokens found when attempting to set value. Nothing done. Token: ' + token.name);
        }
    }

    triggerFlow(tokens:Token[],trigger:Trigger){
            //Trigger flow!
            let fct:FlowCardTrigger = <FlowCardTrigger>ManagerFlow.getCard('trigger','schedule_trigger');
            fct.trigger(tokens, trigger);
            this.homeyApp.log('Triggered schedule item: ' + trigger);
    }
}

