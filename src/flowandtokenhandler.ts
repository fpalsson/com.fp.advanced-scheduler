'use strict';

import { App as HomeyApp } from "homey";
import { Settings as AppSettings } from "../src/settings";
import { FlowCardTrigger, FlowCardAction, FlowToken, ManagerFlow } from "homey";
import { Token } from "./containerclasses";
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

    setupFlowAndTokens() {
        this.homeyApp.log('Setting upp Flows and Tokens');

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
              
                this.homeyApp.log('Trigger Run');
                this.homeyApp.log(args);
                //this.homeyApp.log('Trigger Run');
                shalltrigger = args.schedule.id===state.schedule.id;
                this.homeyApp.log('Will trigger: ' + shalltrigger + ', schedule: ' + args.schedule.name);
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

        try {
            this.tokenwrappers = new Array();
            this.settings.schedules.forEach(schedule => {
              schedule.tokens.forEach(token => {
                //this.homeyApp.log(token);
                let myToken = new FlowToken(token.id, {
                  type: token.type,
                  title: schedule.name + ' - ' + token.name
                })
                this.tokenwrappers.push(new TokenWrapper(myToken,token));
                myToken.register();
              })
            });
        } catch (error) {
            this.homeyApp.log('Not able to setup Tokens! Error: ' + error);

        }

        this.homeyApp.log('Setting upp Flows and Tokens done');
    }

    setTokenValue(token:Token, value:any) {
        let fts:any;
        let tw:TokenWrapper;

        fts = this.tokenwrappers.find(tw=>tw.token.id == token.id);
        if (fts.lenght == 1) {
            tw = fts[0];
            if (tw.token.type == 'boolean') tw.flowtoken.setValue(Boolean(value));
            else if (tw.token.type == 'string') tw.flowtoken.setValue(String(value));
            else if (tw.token.type == 'number') tw.flowtoken.setValue(Number(value));
            this.homeyApp.log('Token: ' + token.name + ', value set to: ' + value);
        }
        else{
            this.homeyApp.log('No or multiple tokens found when attempting to set value. Nothing done. Token: ' + token.name);
        }
    }

    triggerFlow(tokens:Token[],trigger:Trigger){
            //Trigger flow!
            let fct:FlowCardTrigger = <FlowCardTrigger>ManagerFlow.getCard('trigger','schedule_trigger');
            fct.trigger(tokens, trigger);
            this.homeyApp.log('Triggered schedule item: ' + trigger);
    }
}

