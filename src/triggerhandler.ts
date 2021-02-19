'use strict';

import { executionAsyncResource } from "async_hooks";
import { App as HomeyApp, ManagerFlow } from "homey";
import { Settings as AppSettings } from "../src/settings";
import { Schedule, ScheduleItem, Token, DaysType, TimeType } from "./containerclasses";
import { FlowAndTokenHandler } from "./flowandtokenhandler";
import { SunWrapper } from "./SunWrapper";
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
    private sunWrapper:SunWrapper;
    private triggers:Trigger[];
    private runningtimer:NodeJS.Timeout;

    constructor(homeyApp:HomeyApp, settings:AppSettings, flowandtokenhandler:FlowAndTokenHandler, sunWrapper:SunWrapper) {
        this.selfie=this;
        this.homeyApp=homeyApp;
        this.settings=settings;
        this.flowandtokenhandler=flowandtokenhandler;
        this.sunWrapper=sunWrapper;
    }

    setupTriggers(mode:'startup'|'midnight'){
        this.homeyApp.log('Setting up Triggers');

        this.triggers = new Array();

        this.sunWrapper.refreshTimes();

        this.settings.schedules.forEach(schedule => {
            schedule.scheduleitems.forEach(scheduleitem => {
                if (scheduleitem.daystype === DaysType.DaysOfWeek)
                {
                    if (this.dayHitTest(scheduleitem.daystype, scheduleitem.daysarg)){
                        this.addScheduleItemToTriggers(mode, schedule, scheduleitem);
                    }
                    else{
                        this.homeyApp.log('Not added (no match on day): ');
                        this.homeyApp.log(schedule.name);
                        this.homeyApp.log(scheduleitem);
                    }
                }
            })
        })
        this.homeyApp.log('Setting up Triggers done');
    }

    private addScheduleItemToTriggers(mode:'startup'|'midnight', s:Schedule, si:ScheduleItem){
        let triggertime:Date;
        let timenow = new Date();
        if (si.timetype == TimeType.TimeOfDay ){
            triggertime = this.parseTime(si.timearg);
        }
        else if (si.timetype === TimeType.Solar){
            let ti = this.sunWrapper.getTime(si.suneventtype);
            if (ti==null)
            {
                this.homeyApp.log('Solar error' + si.suneventtype);
            }
            triggertime = ti.time;
            let offset = this.parseTime(si.timearg);
            offset = new Date(0,0,0,offset.getHours(),offset.getMinutes(), offset.getSeconds());
            triggertime.setTime(triggertime.getTime() + offset.getTime());
            if (triggertime==null) {
                this.homeyApp.log('Solar event: ' + si.timearg + ' not known!');
                return;    
            }
            this.homeyApp.log('Added solar event: ' + si.suneventtype + ' with time: ' + triggertime.toTimeString() + ' (offset: ' + offset.toTimeString() + ')');
        }
        else {
            this.homeyApp.log('Unknown trigger type!');
            return;
        }    

        if (mode != 'midnight'){
            if (triggertime<timenow) {
                this.homeyApp.log('Not added (too late this day): ');
                this.homeyApp.log(s.name);
                this.homeyApp.log(si);
                return; //time has already passed, a little crude but it will likely work :-)
            }
        }

        let trigger = new Trigger(triggertime,s,si);

        this.triggers.push(trigger);
        this.homeyApp.log('Trigger added');
        this.homeyApp.log(trigger);

        
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

    private dayHitTest(daystype:DaysType, days:number){
        let date = new Date();
        let dayofweek = date.getDay();
        if (dayofweek===0) dayofweek=7; //sunday returns 0 we want it to be 7

        let dayofweekbit = 1 << (dayofweek - 1);

        let hit = (dayofweekbit & days) > 0;

        this.homeyApp.log('Current day: ' + dayofweek + ', days: ' + this.dec2bin(days) + ', daybit: ' + this.dec2bin(dayofweekbit) + ', hit: ' + hit);
        return hit;
    }

    private dec2bin(dec){
        return (dec >>> 0).toString(2);
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
                
                this.runningtimer = setTimeout(function() { this.timerCallback('next'); }.bind(this), 100);

            }  
        } 
        else if (arg === 'next') {
            //this.homeyApp.log('Next');

            if (earliesttrigger != null) {
                let now = new Date();
                
                let delta = earliesttrigger.triggertime.getTime()-now.getTime();
                if (delta < 100) delta = 100;
                if (delta > 60000) {
                    delta = 60000;
                    this.runningtimer = setTimeout(function() { this.timerCallback('next'); }.bind(this), delta);
                }
                else{
                    this.runningtimer = setTimeout(function() { this.timerCallback('execute'); }.bind(this), delta);
                    
                }
            }
            else
            {
                this.runningtimer = setTimeout(function() { this.timerCallback('idle'); }.bind(this), 100);
                
            }

        }
        else if (arg === 'idle') {
            //this.homeyApp.log('Idle');

            //No more timers this day, lets wait for a new day. :-)
            let now = new Date();
            let midnight = new Date(); //Get current time
            midnight.setHours(0, 0 , 0, 0); //Set last midnight
            midnight.setTime(midnight.getTime() + 24*60*60*1000); //add one day to get comming midnight
            let delta = midnight.getTime()-now.getTime();
            if (delta > 60000) {
                delta = 60000;
                this.runningtimer = setTimeout(function() { this.timerCallback('idle'); }.bind(this), delta);
            }
            else{
                
                this.runningtimer = setTimeout(function() { this.timerCallback('midnight'); }.bind(this), delta);
            }
        }
        else if (arg === 'midnight') {
            this.homeyApp.log('Midnight, getting new triggers for today!');
            this.setupTriggers('midnight');
            this.runningtimer = setTimeout(function() { this.timerCallback('next'); }.bind(this), 100);
            
        }
        else {
            //unexpected!
            this.homeyApp.log('Somehow we ended up with a timer callback that has unknown arg: ' + arg);
            this.runningtimer = setTimeout(function() { this.timerCallback('next'); }.bind(this), 60000);
            
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
        this.runningtimer = setTimeout(function() { this.timerCallback('next'); }.bind(this), 5000);
    }

    stopTimer() {
        if (this.runningtimer!=null)
            clearTimeout(this.runningtimer);
    }

        
}
    


    


