'use strict';

import { App as HomeyApp } from "homey";
import { Settings as AppSettings } from "./Settings";
import { FlowCardTrigger, FlowCardAction, FlowToken, ManagerFlow } from "homey";
import { Token, Schedule } from "./ContainerClasses";
import { Trigger } from "./TriggerHandler";
import { timeStamp } from "console";

class TokenWrapper{
    constructor(flowToken:FlowToken, token:Token) {
        this.flowToken=flowToken;
        this.token=token;
    }
    flowToken:FlowToken;
    token:Token;
}

export class FlowAndTokenHandler {
    private homeyApp:HomeyApp;
    private settings:AppSettings;
    private tokenWrappers:TokenWrapper[];
    
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
                let shallTrigger = true;
              
                //this.homeyApp.log('Trigger Run');
                let s = <Schedule>args.schedule;
                shallTrigger = s.id===state.schedule.id;
                this.homeyApp.log('Will trigger: ' + shallTrigger + ', schedule: ' + s.name);
                return Promise.resolve( shallTrigger );
          
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
            if (this.tokenWrappers==null) {
                this.tokenWrappers = new Array();    
            }
            let mf = ManagerFlow;
            let ps:Promise<any>[] = new Array();
            this.tokenWrappers.forEach(tw => {
                this.homeyApp.log('Unregistering token with id: ' + tw.token.id + ", name: " + tw.token.name);
                
                //let pr = new Promise
                let promise = tw.flowToken.unregister();
                ps.push(promise);
                //mf.unregisterToken(tw.flowtoken);  
                this.homeyApp.log('Unregistered token with id: ' + tw.token.id + ", name: " + tw.token.name);
            })
            Promise.all(ps).then(() => {
                this.homeyApp.log('All tokens unregged')

                this.tokenWrappers = new Array();
                this.settings.schedules.forEach(schedule => {
                    schedule.tokens.forEach(token => {
    
                        let myToken = new FlowToken('schedule' + schedule.id + '-token' + token.id, {
                        type: token.type,
                        title: schedule.name + ' - ' + token.name
                        })


                        this.tokenWrappers.push(new TokenWrapper(myToken,token));
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

        ftw = this.tokenWrappers.find(tw=>tw.token.id == token.id);
        if (ftw != null) {
            let t = ftw.token;
            let ft = ftw.flowToken;
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

