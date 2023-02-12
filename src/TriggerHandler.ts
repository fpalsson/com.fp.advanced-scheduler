'use strict';

import { executionAsyncResource } from "async_hooks";
import { App as HomeyApp } from "homey";
import { FlowAndTokenHandler } from "./FlowAndTokenHandler";
import { SunWrapper, SunEventInfo } from "./SunWrapper";
import  * as moment  from 'moment';

// this is copied from settings-src/src by build task. Not elegant, but...
import { ASSettings, Schedule, ScheduleItem, Token, DaysType, TimeType, TimeInfo } from "./CommonContainerClasses";

import { isMainThread } from "worker_threads";
//import { FlowCardTrigger, FlowCardAction, FlowToken } from "homey";

export class Trigger{
    constructor(triggerTime: Date, schedule:Schedule, scheduleItem:ScheduleItem) {
        this.triggerTime=triggerTime;
        this.schedule=schedule;
        this.scheduleItem=scheduleItem;
//        this.tokens=tokens; 
    }
    triggerTime:Date;
    schedule:Schedule;
    scheduleItem:ScheduleItem;
  //  tokens:Token[];
}


export class TriggerHandler {
    private selfie:TriggerHandler;
    private homeyApp:HomeyApp;
    private settings:ASSettings;
    private flowandtokenhandler:FlowAndTokenHandler;
    private sunWrapper:SunWrapper;
    private triggers:Trigger[];
    private runningtimer:NodeJS.Timeout;

    constructor(homeyApp:HomeyApp, settings:ASSettings, flowandtokenhandler:FlowAndTokenHandler, sunWrapper:SunWrapper) {
        this.selfie=this;
        this.homeyApp=homeyApp;
        this.settings=settings;
        this.flowandtokenhandler=flowandtokenhandler;
        this.sunWrapper=sunWrapper;
    }

    setSettings(settings:ASSettings)
    {
        this.settings = settings;
    }

    setupTriggers(mode:'startup'|'midnight'){
        this.homeyApp.log('Setting up Triggers');

        this.triggers = new Array();

        //this.sunWrapper.refreshTimes();

        this.settings.schedules.forEach(schedule => {
            if (schedule.active){
                schedule.scheduleItems.forEach(scheduleitem => {
                    if (scheduleitem.daysType === DaysType.DaysOfWeek)
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
            }
            else{
                this.homeyApp.log('Schedule ' + schedule.name + ' inactive, skipping');
            }
        })

        this.homeyApp.log('Summary all triggers');
        this.triggers.forEach(trigger => {
            this.homeyApp.log('Schedule: ' + trigger.schedule.name + ', time: ' + trigger.triggerTime + '(' + trigger.scheduleItem.mainTrigger.sunEvent + ')');
        })


        this.homeyApp.log('Setting up Triggers done');
    }

    private 

    private getTriggerTime(si:ScheduleItem, date:Date):Date {
        let resTime:Date;
        if (!si.randomTrigger.used) resTime = this.getTimeInfoTime(si.mainTrigger, date);
        else {
            let mtTime:Date = this.getTimeInfoTime(si.mainTrigger, date);
            let rtTime:Date = this.getTimeInfoTime(si.randomTrigger, date);
            let msdiff = rtTime.getTime() - mtTime.getTime();
            let offset = Math.random() * msdiff;
            let resDate = new Date(mtTime.getTime() + offset);

            this.homeyApp.log('Random Time mt: ' + mtTime + ' rt: ' + rtTime + ' diff: ' + msdiff + ' offset: ' + offset + ' resdate: ' + resDate);

            resTime = resDate;
        }
        if (si.triggerFirstOf.used) {
            let firstTime:Date = this.getTimeInfoTime(si.triggerFirstOf, date);
            resTime = new Date(Math.min(firstTime.getTime(),resTime.getTime()));
        } 
        if (si.triggerLastOf.used) {
            let lastTime:Date = this.getTimeInfoTime(si.triggerLastOf, date);
            resTime = new Date(Math.max(lastTime.getTime(),resTime.getTime()));
        } 

        return resTime;
    }

    private getTimeInfoTime(ti:TimeInfo, date:Date):Date {
        let dateAtMidnightCallingDate = new Date(date.getFullYear(),date.getMonth(), date.getDate());
        if (ti.timeType == TimeType.TimeOfDay) return new Date(dateAtMidnightCallingDate.getTime() + this.parseTime(ti.time)); 
        else if (ti.timeType == TimeType.Solar) {
            let sei:SunEventInfo = this.sunWrapper.getTime(date, ti.sunEvent);

            let seTime = sei.time;
            let offset = this.parseOffset(ti.solarOffset);
            seTime.setTime(seTime.getTime() + offset);

            return seTime;
        }

    }

    private addScheduleItemToTriggers(mode:'startup'|'midnight', date:Date, s:Schedule, si:ScheduleItem){
        //this.homeyApp.log('addScheduleItemToTriggers, date: ' + date);

        let now = new Date();
        let triggerTime:Date;
        let dateAtMidnightToday = new Date(now.getFullYear(),now.getMonth(), now.getDate());
        let dateAtMidnightCallingDate = new Date(date.getFullYear(),date.getMonth(), date.getDate());

        //this.homeyApp.log('addScheduleItemToTriggers, midnight: ' + dateAtMidnightToday);

        triggerTime = this.getTriggerTime(si, dateAtMidnightCallingDate);
        if (!this.isValidDate(triggerTime)) {
            this.homeyApp.log('Not a valid date to trigger on. Not added.') ;
            return; //
        }


        if (si.onlyTriggerIfBefore.used){
            let onlyTriggerIfBeforeTime = this.getTimeInfoTime(si.onlyTriggerIfBefore, dateAtMidnightCallingDate)
            if (this.isValidDate(onlyTriggerIfBeforeTime)) {
                if (triggerTime >= onlyTriggerIfBeforeTime) {
                    this.homeyApp.log('Not added as trigger is after before-condition: ' + triggerTime + ' >= ' + onlyTriggerIfBeforeTime) ;
                    return; //
                }
            }
            else {
                this.homeyApp.log('Only trigger if before is not a valid date. Not evaluated');
            }
        }

        if (si.onlyTriggerIfAfter.used){
            let onlyTriggerIfAfterTime = this.getTimeInfoTime(si.onlyTriggerIfAfter, dateAtMidnightCallingDate)
            if (this.isValidDate(onlyTriggerIfAfterTime)) {
                if (triggerTime <= onlyTriggerIfAfterTime) {
                    this.homeyApp.log('Not added as trigger is before after-condition: ' + triggerTime + ' <= ' + onlyTriggerIfAfterTime) ;
                    return; //
                }
            }
            else {
                this.homeyApp.log('Only trigger if after is not a valid date. Not evaluated');
            }

        }

        if (!this.dayHitTest(si.daysType,si.daysArg,date)){
            this.homeyApp.log('Dayhit failed ' + s.name + ', time: ' + triggerTime) ;
            return;
        }

        let dateNextMidnight = new Date(dateAtMidnightToday.getTime() + 24*60*60*1000);
        

        this.homeyApp.log('Trigger compare: ' + triggerTime + ' : ' + dateAtMidnightToday + ' : ' + dateNextMidnight) ;

        if (triggerTime<dateAtMidnightToday) {
            this.homeyApp.log('Not added (before midnight): ' + s.name + ', time: ' + triggerTime) ;
            return; //time has already passed, a little crude but it will likely work :-)
        }
        else if (triggerTime>=dateNextMidnight) {
            this.homeyApp.log('Not added (next day): ' + s.name + ', time: ' + triggerTime) ;
            return; //time will be added next round, a little crude but it will likely work :-)

        } else if (mode == 'startup' && triggerTime < now) {
            this.homeyApp.log('Not added (before now): ' + s.name + ', time: ' + triggerTime) ;
            return; //time has already passed, a little crude but it will likely work :-)
        }
        



        let trigger = new Trigger(triggerTime,s,si);

        this.triggers.push(trigger);
        if (trigger.scheduleItem.mainTrigger.timeType == TimeType.TimeOfDay)
            this.homeyApp.log('Trigger added, schedule: ' + trigger.schedule.name + ', Time: ' + trigger.triggerTime);
        else if (trigger.scheduleItem.mainTrigger.timeType == TimeType.Solar)
            this.homeyApp.log('Trigger added, schedule: ' + trigger.schedule.name + ', Solar: ' + trigger.scheduleItem.mainTrigger.sunEvent + '(' + trigger.triggerTime + ')');
        //this.homeyApp.log(trigger);

        
    }

    private isValidDate(d:Date) {
        return d instanceof Date && !isNaN(d.getTime());
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
        if (this.triggers.length>0) earliesttrigger = this.triggers.sort((a, b) => (a.triggerTime > b.triggerTime) ? 1 : -1)[0];

        if (arg === 'execute') {
            //this.homeyApp.log('Execute!');
            if (earliesttrigger != null) {
                // Set tokens!
                earliesttrigger.scheduleItem.tokenSetters.forEach(ts => {
                    //Set token in flowtoken
                    this.flowandtokenhandler.setTokenValue(ts.token,ts.value);
                })

                this.flowandtokenhandler.triggerFlow(earliesttrigger.scheduleItem.tokenSetters.map(ts=>ts.token), earliesttrigger);

                this.removeTrigger(earliesttrigger);
                //this.homeyApp.log('Removed trigger from list: ' + earliesttrigger);
                
                this.runningtimer = setTimeout(function() { this.timerCallback('next'); }.bind(this), 100);
                
                //this.homeyApp.log('Execution done');
                
            }     
        } 
        else if (arg === 'next') {
            //this.homeyApp.log('Next');

            if (earliesttrigger != null) {
                let now = new Date();
                
                let delta = earliesttrigger.triggerTime.getTime()-now.getTime();
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
    


    


