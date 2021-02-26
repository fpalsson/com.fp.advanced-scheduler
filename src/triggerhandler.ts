'use strict';

import { executionAsyncResource } from "async_hooks";
import { App as HomeyApp, ManagerFlow } from "homey";
import { Settings as AppSettings } from "../src/settings";
import { Schedule, ScheduleItem, Token, DaysType, TimeType } from "./containerclasses";
import { FlowAndTokenHandler } from "./flowandtokenhandler";
import { SunWrapper, TimeInfo } from "./SunWrapper";
import  * as moment  from 'moment';
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

        //this.sunWrapper.refreshTimes();

        this.settings.schedules.forEach(schedule => {
            schedule.scheduleitems.forEach(scheduleitem => {
                if (scheduleitem.daystype === DaysType.DaysOfWeek)
                {
                    let now = new Date();
                    let yesterday = new Date(); yesterday.setTime(now.getTime()-24*60*60*1000);
                    let tomorrow = new Date(); tomorrow.setTime(now.getTime()+24*60*60*1000);
                    
                    //this.homeyApp.log('before addScheduleItemToTriggers, date: ' + now);
                    //this.homeyApp.log('before addScheduleItemToTriggers, yesterday: ' + yesterday);
                    
                    this.addScheduleItemToTriggers(mode, yesterday, schedule, scheduleitem);
                    this.addScheduleItemToTriggers(mode, now, schedule, scheduleitem);
                    this.addScheduleItemToTriggers(mode, tomorrow, schedule, scheduleitem);
                }
            })
        })

        this.homeyApp.log('Summary all triggers');
        this.triggers.forEach(trigger => {
            this.homeyApp.log('Schedule: ' + trigger.schedule.name + ', time: ' + trigger.triggertime + '(' + trigger.scheduleitem.suneventtype + ')');
        })


        this.homeyApp.log('Setting up Triggers done');
    }

    private 

    private addScheduleItemToTriggers(mode:'startup'|'midnight', date:Date, s:Schedule, si:ScheduleItem){
        //this.homeyApp.log('addScheduleItemToTriggers, date: ' + date);

        let now = new Date();
        let triggertime:Date;
        let dateAtMidnightToday = new Date(now.getFullYear(),now.getMonth(), now.getDate());
        let dateAtMidnightCallingDate = new Date(date.getFullYear(),date.getMonth(), date.getDate());

        //this.homeyApp.log('addScheduleItemToTriggers, midnight: ' + dateAtMidnightToday);

        if (si.timetype == TimeType.TimeOfDay ){
            triggertime = new Date(dateAtMidnightCallingDate.getTime() + this.parseTime(si.timearg));
        }
        else if (si.timetype === TimeType.Solar){
            let ti:TimeInfo = this.sunWrapper.getTime(date, si.suneventtype);
            if (ti==null)
            {
                this.homeyApp.log('Solar error' + si.suneventtype);
            }
            triggertime = ti.time;
            if (triggertime==null) {
                this.homeyApp.log('Solar event: ' + si.timearg + ' not known!');
                return;    
            }
            let offset = this.parseOffset(si.timearg);
            this.homeyApp.log('Solar offset: ' + offset);
            triggertime.setTime(triggertime.getTime() + offset);

//            this.homeyApp.log('Added solar event: ' + si.suneventtype + ' with time: ' + triggertime.toTimeString() + ' (offset: ' + offset.toTimeString() + ')');
        }
        else {
            this.homeyApp.log('Unknown trigger type!');
            return;
        }    

        if (!this.dayHitTest(si.daystype,si.daysarg,date)){
            this.homeyApp.log('Dayhit failed ' + s.name + ', time: ' + triggertime) ;
            return;
        }

        let dateNextMidnight = new Date(dateAtMidnightToday.getTime() + 24*60*60*1000);
        

        this.homeyApp.log('Trigger compare: ' + triggertime + ' : ' + dateAtMidnightToday + ' : ' + dateNextMidnight) ;

        if (triggertime<dateAtMidnightToday) {
            this.homeyApp.log('Not added (before midnight): ' + s.name + ', time: ' + triggertime) ;
            return; //time has already passed, a little crude but it will likely work :-)
        }
        else if (triggertime>dateNextMidnight) {
            this.homeyApp.log('Not added (next day): ' + s.name + ', time: ' + triggertime) ;
            return; //time will be added next round, a little crude but it will likely work :-)

        } else if (mode == 'startup' && triggertime < now) {
            this.homeyApp.log('Not added (before now): ' + s.name + ', time: ' + triggertime) ;
            return; //time has already passed, a little crude but it will likely work :-)
        }
        

        let trigger = new Trigger(triggertime,s,si);

        this.triggers.push(trigger);
        if (trigger.scheduleitem.timetype == TimeType.TimeOfDay)
            this.homeyApp.log('Trigger added, schedule: ' + trigger.schedule.name + ', Time: ' + trigger.triggertime);
        else if (trigger.scheduleitem.timetype == TimeType.Solar)
            this.homeyApp.log('Trigger added, schedule: ' + trigger.schedule.name + ', Solar: ' + trigger.scheduleitem.suneventtype + '(' + trigger.triggertime + ')');
        //this.homeyApp.log(trigger);

        
    }

    //return milliseconds offset
    private parseOffset(offsetString:string):number {
        if (offsetString == '') return null;
        
        let negative = 1;
        if (offsetString.trim()[0] == '-') {
            negative = -1;
            offsetString = offsetString.replace('-','');
        }

        return this.parseTime(offsetString)*negative;
    } 
    
    //return milliseconds since midnight
    private parseTime(timeString:string):number {
        let res:number = 0;
        if (timeString == '') return null;
        let parts = timeString.trim().split(':');
        if (parts.length==2){
            res = (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60) * 1000;
        }
        else if (parts.length==3){
            res = (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])) * 1000;
        }
        else
            this.homeyApp.log('Incorrect time format: ' + timeString);

        return res;
    } 

    private dayHitTest(daystype:DaysType, days:number, date:Date){
        let dayofweek = date.getDay();
        if (dayofweek===0) dayofweek=7; //sunday returns 0 we want it to be 7

        let dayofweekbit = 1 << (dayofweek - 1);

        let hit = (dayofweekbit & days) > 0;

        //this.homeyApp.log('Current day: ' + dayofweek + ', days: ' + this.dec2bin(days) + ', daybit: ' + this.dec2bin(dayofweekbit) + ', hit: ' + hit);
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
                earliesttrigger.scheduleitem.tokensetters.forEach(ts => {
                    //Set token in flowtoken
                    this.flowandtokenhandler.setTokenValue(ts.token,ts.value);
                })

                this.flowandtokenhandler.triggerFlow(earliesttrigger.scheduleitem.tokensetters.map(ts=>ts.token), earliesttrigger);

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
    


    


