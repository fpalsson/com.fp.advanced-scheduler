'use strict';

import { executionAsyncResource } from "async_hooks";
import { App as HomeyApp, ManagerFlow } from "homey";
import { Settings as AppSettings } from "../src/settings";
import { Schedule, ScheduleItem, Token, DaysType, TimeType } from "./containerclasses";
import { FlowAndTokenHandler } from "./flowandtokenhandler";
//import { FlowCardTrigger, FlowCardAction, FlowToken } from "homey";

export class Trigger{
    constructor(triggertime: Date, schedule:Schedule, scheduleitem:ScheduleItem) {
        this.triggertime=triggertime;
        this.schedule=schedule;
        this.scheduleitem=scheduleitem;
//        this.tokens=tokens; 
    }
    triggertime:Date;
    schedule:Schedule;
    scheduleitem:ScheduleItem;
  //  tokens:Token[];
}


export class TriggerHandler {
    private selfie:TriggerHandler;
    private homeyApp:HomeyApp;
    private settings:AppSettings;
    private flowandtokenhandler:FlowAndTokenHandler;
    private triggers:Trigger[];

    constructor(homeyApp:HomeyApp, settings:AppSettings, flowandtokenhandler:FlowAndTokenHandler) {
        this.selfie=this;
        this.homeyApp=homeyApp;
        this.settings=settings;
        this.flowandtokenhandler=flowandtokenhandler;
    }

    setupTriggers(mode:'startup'|'midnight'){
        this.homeyApp.log('Setting up Triggers');

        this.triggers = new Array();

        this.settings.schedules.forEach(schedule => {
            schedule.scheduleitems.forEach(scheduleitem => {
                if (scheduleitem.daytype === DaysType.DaysOfWeek)
                {
                    if (this.dayHitTest(scheduleitem.daysarg)){
                        this.addScheduleItemToTriggers(mode, schedule, scheduleitem);
                    }
                    else{
                        this.homeyApp.log('Not added (no match on day): ');
                        this.homeyApp.log(schedule);
                        this.homeyApp.log(scheduleitem);
                    }
                }
            })
        })
        this.homeyApp.log('Setting up Triggers done');
    }

    private addScheduleItemToTriggers(mode:'startup'|'midnight', s:Schedule, si:ScheduleItem){
        if (si.timetype == TimeType.TimeOfDay ){
            let triggertime = this.parseTime(si.timearg);
            let timenow = new Date();
            
            if (mode != 'midnight')
                if (triggertime<timenow) {
                    this.homeyApp.log('Not added (too late this day): ');
                    this.homeyApp.log(s);
                    this.homeyApp.log(si);
                    return; //time has already passed, a little crude but it will likely work :-)
                }

            let trigger = new Trigger(triggertime,s,si);

            this.triggers.push(trigger);
            this.homeyApp.log('Trigger added');
            this.homeyApp.log(trigger);

        }
        else if (si.timetype === TimeType.Solar){
            this.homeyApp.log('Solar trigger not yet supported');
        }
        else {
            this.homeyApp.log('Unknown trigger type!');
        }
    }

    private parseTime(timeString):Date {
        if (timeString == '') return null;
        var d = new Date();
        var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/);
        d.setHours( parseInt(time[1]) + ( ( parseInt(time[1]) < 12 && time[4] ) ? 12 : 0) );
        d.setMinutes( parseInt(time[3]) || 0 );
        d.setSeconds(0, 0);
        return d;
    } // parseTime()

    private dayHitTest(days:number){
        let date = new Date();
        let dayofweek = date.getDay();
        if (dayofweek===0) dayofweek=7; //sunday returns 0 we want it to be 7

        this.homeyApp.log('Current day: ' + dayofweek + ', days: ' + days);

        let dayofweekbit = 1 << (dayofweek - 1);

        this.homeyApp.log('Bit: ' + dayofweekbit);

        let hit = (dayofweekbit & days) > 0;
        this.homeyApp.log('Hit: ' + hit);
        return hit;
    }

    
    private timerCallback(arg: 'execute'|'next'|'idle'|'midnight') {

        let earliesttrigger:Trigger;
        if (this.triggers.length>0) earliesttrigger = this.triggers.sort((a, b) => (a.triggertime > b.triggertime) ? 1 : -1)[0];

        if (arg === 'execute') {
            this.homeyApp.log('Execute!');
            if (earliesttrigger != null) {
                // Set tokens!
                earliesttrigger.scheduleitem.tokenitems.forEach(ti => {
                    //Set token in flowtoken
                    this.flowandtokenhandler.setTokenValue(ti.token,ti.value);
                })

                this.flowandtokenhandler.triggerFlow(earliesttrigger.scheduleitem.tokenitems.map(ti=>ti.token), earliesttrigger);

                this.removeTrigger(earliesttrigger);
                this.homeyApp.log('Removed trigger from list: ' + earliesttrigger);
                
                setTimeout(function() { this.timerCallback('next'); }.bind(this), 100);

            }  
        } 
        else if (arg === 'next') {
            this.homeyApp.log('Next');

            if (earliesttrigger != null) {
                let now = new Date();
                
                let delta = earliesttrigger.triggertime.getTime()-now.getTime();
                if (delta < 100) delta = 100;
                if (delta > 60000) {
                    delta = 60000;
                    setTimeout(function() { this.timerCallback('next'); }.bind(this), delta);
                }
                else{
                    setTimeout(function() { this.timerCallback('execute'); }.bind(this), delta);
                    
                }
            }
            else
            {
                setTimeout(function() { this.timerCallback('idle'); }.bind(this), 100);
                
            }

        }
        else if (arg === 'idle') {
            this.homeyApp.log('Idle');

            //No more timers this day, lets wait for a new day. :-)
            let now = new Date();
            let midnight = new Date(); //Get current time
            midnight.setHours(0, 0 , 0, 0); //Set last midnight
            midnight.setTime(midnight.getTime() + 24*60*60*1000); //add one day to get comming midnight
            let delta = midnight.getTime()-now.getTime();
            if (delta > 60000) {
                delta = 60000;
                setTimeout(function() { this.timerCallback('idle'); }.bind(this), delta);
            }
            else{
                
                setTimeout(function() { this.timerCallback('midnight'); }.bind(this), delta);
            }
        }
        else if (arg === 'midnight') {
            this.homeyApp.log('Midnight, getting new triggers for today!');
            this.setupTriggers('midnight');
            setTimeout(function() { this.timerCallback('next'); }.bind(this), 100);
            
        }
        else {
            //unexpected!
            this.homeyApp.log('Somehow we ended up with a timer callback that has unknown arg: ' + arg);
            setTimeout(function() { this.timerCallback('next'); }.bind(this), 60000);
            
        }
        }

        private removeTrigger(trigger) {
        for( var i = 0; i < this.triggers.length; i++){ 
        
            if ( this.triggers[i] === trigger) { 
        
            this.triggers.splice(i, 1); 
            }
        }
    }

    startTimer() {
        setTimeout(function() { this.timerCallback('next'); }.bind(this), 5000);
    }
        
}
    


    


