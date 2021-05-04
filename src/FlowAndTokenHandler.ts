'use strict';

import { App as HomeyApp } from "homey";
//import { Settings as AppSettings } from "./Settings";
import { FlowCardTrigger, FlowCardAction, FlowToken, ManagerFlow } from "homey";
import { Trigger } from "./TriggerHandler";

// this is copied from settings-src/src by build task. Not elegant, but...
import { ASSettings, Token, Schedule } from "./CommonContainerClasses";

class TokenWrapper{
    constructor(flowToken:FlowToken, token:MiniToken) {
        this.flowToken=flowToken;
        this.token=token;
    }
    flowToken:FlowToken;
    token:MiniToken;
}

export class FlowAndTokenHandler {
    private homeyApp:HomeyApp;
    private schedules:MiniSchedule[];
    private tokenWrappers:TokenWrapper[];
    
    constructor(homeyApp:HomeyApp, schedules:Schedule[]) {
        this.homeyApp=homeyApp;
        this.setSchedules(schedules);
    }

    setSchedules(schedules:Schedule[])
    {
        this.schedules=new Array();
        schedules.forEach(schedule => {
            this.schedules.push(new MiniSchedule(schedule))
        });
    }

    setupFlows() {
        this.homeyApp.log('Setting upp Flows');

        try {
            let myTrigger = new FlowCardTrigger('schedule_trigger');

            //Needed?
            myTrigger.register();
            let myTriggerMyArg = myTrigger.getArgument('schedule');
            myTriggerMyArg.registerAutocompleteListener( ( query, args ) => {
                //refactor
                let results = this.schedules;
//                this.homeyApp.log(results);
                results = results.filter( result => {
                    return result.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
                });
                return Promise.resolve( results );
            }); 
        
            myTrigger.registerRunListener(async ( args, state:MiniSchedule ) => {
                try {
                    //this.homeyApp.log('Trigger Run');
                    let shallTrigger:Boolean;
              
                    let s = <Schedule>args.schedule;
                    shallTrigger = s.id===state.id;
                    if (shallTrigger) {
                        this.homeyApp.log('Will trigger: ' + shallTrigger + ', schedule: ' + state.name);
                        if (s.name!=state.name) this.homeyApp.log('Warning! Schedule name in flow differs from that in settings. This could mean settings has been replaced. Make sure this is correct. Schedule name from flow: ' + s.name);
                    }
                    return Promise.resolve( shallTrigger );
                        
                } catch (error) {
                    return Promise.reject(error);                    
                }
          
            })
        
            let myAction = new FlowCardAction('change_schedule_state');
              
            //Needed?
            myAction.register();
            let myActionMyArg = myAction.getArgument('schedule');
            myActionMyArg.registerAutocompleteListener( ( query, args ) => {
                //refactor
                let results = this.schedules;
//                this.homeyApp.log(results);
                results = results.filter( result => {
                    return result.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
                });
                return Promise.resolve( results );
            }); 

            myAction.registerRunListener (async ( args, state:MiniSchedule ) => {
                try {
                    this.homeyApp.log('Action Run');
              
                    let active:Boolean = args.state == 'active';
                    let s = <Schedule>args.schedule;
                    console.log ('Schedule with id ' + s.id + ' was set to state ' + active);

                    return Promise.resolve( active );
                        
                } catch (error) {
                    return Promise.reject(error);                    
                }
            })
                
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
                this.schedules.forEach(schedule => {
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
        //this.homeyApp.log('Trigger Flow started');
        let fct:FlowCardTrigger = <FlowCardTrigger>ManagerFlow.getCard('trigger','schedule_trigger');
        
        let ms = new MiniSchedule(trigger.schedule);
        let mts:MiniToken[] = new Array();
        tokens.forEach(t => {
            let mt = new MiniToken(t);
            mts.push(mt);
        });
        
        fct.trigger(mts, ms);
        //this.homeyApp.log('Triggered schedule item: ' + trigger);
    }
}

export class MiniSchedule {
    constructor(schedule:Schedule) {
        this.id=schedule.id;
        this.name=schedule.name;
        this.tokens = new Array();
        schedule.tokens.forEach(token => {
            this.tokens.push(new MiniToken(token));
        }); 
    }

    id:number;
    name:string;
    tokens:MiniToken[];
}


export class MiniToken {
    constructor(token:Token){
        this.id=token.id;
        this.name=token.name;
        this.type=token.type;
    }

    id:number;
    name:string;
    type: "boolean" | "number" | "string" ;
}
