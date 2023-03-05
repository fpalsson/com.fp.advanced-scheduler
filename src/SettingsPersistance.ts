'use strict';

//import { SendHandle } from "child_process";
//import { threadId } from "worker_threads";
import { ASSettings, Schedule, DaysType, TimeInfo, TimeType, Token, TokenSetter, ScheduleItem } from "./CommonContainerClasses";
 
export class SettingsPersistance {
    
    public settings:ASSettings; //Lets expose it publicly for now, refactor later.

    constructor() {
        //vad vet jag
    }
   
    

    getSettings():ASSettings{
        return this.settings;
    }

    buildSettings(settings:ASSettings) {
        return this.buildSettingsVersion2(settings);
    }

    //Only kept for testing purposes
    buildSettingsVersion1(settings:ASSettings) {
        let localsettings = {settings:{
                schedules:[]
            }
        }

        //console.log('Build start');

        let ss:Schedule[] = settings.schedules; 
        ss.forEach(schedule => {
            let jsonsched = {
                'id':schedule.id,
                'name':schedule.name,
                'active':schedule.active,
                'tokens':[],
                'scheduleitems':[],
            }
            schedule.tokens.forEach(token=>{
                jsonsched.tokens.push({
                    'id':token.id,
                    'name':token.name,
                    'type':token.type,
                })
                //console.log('Build push token');

            })

            schedule.scheduleItems.forEach(si=>{
                let tss = new Array();
                si.tokenSetters.forEach(ts=>{
                    tss.push({
                        'id':ts.token.id,
                        'value':ts.value,
                    })  
                    //console.log('Build push token setter');
                })

                let dt:string;
                switch (si.daysType){
                    case DaysType.DaysOfWeek: { dt = 'daysofweek'; break; }
                    case DaysType.DaysOfMonth: { dt = 'daysofmonth'; break; }
                }

                let tt:string;
                let setype:string;
                let timeArg:string;
                if (si.mainTrigger.timeType == TimeType.TimeOfDay) { 
                    tt = 'timeofday';
                    timeArg = si.mainTrigger.time; 
                }
                else if (si.mainTrigger.timeType == TimeType.Solar) { 
                    tt = 'solar:' + si.mainTrigger.sunEvent; 
                    timeArg = si.mainTrigger.solarOffset;
                }

                jsonsched.scheduleitems.push({
                    'id':si.id,
                    'daystype':dt,
                    'daysarg':si.daysArg,
                    'timetype':tt,
                    'timearg':timeArg,
                    'tokensetters':tss,
                })
                //console.log('Build push si');
            })
            localsettings.settings.schedules.push(jsonsched);
            //console.log('Build push sched');
        })

        //console.log('Build returning');
        return JSON.stringify(localsettings);
    }

    buildSettingsVersion2(settings:ASSettings) {
        let localsettings = {
            settingsVersion:2,
            settings:{
                schedules:[],
            }
        }

        let ss:Schedule[] = settings.schedules; 
        ss.forEach(schedule => {
            let shedo = {
                'id':schedule.id,
                'name':schedule.name,
                'active':schedule.active,
                'tokens':[],
                'scheduleItems':[],
            }
            schedule.tokens.forEach(token=>{
                shedo.tokens.push({
                    'id':token.id,
                    'name':token.name,
                    'type':token.type,
                })
            })

            schedule.scheduleItems.forEach(si=>{
                let tss = new Array();
                si.tokenSetters.forEach(ts=>{
                    tss.push({
                        'id':ts.token.id,
                        'value':ts.value,
                    })  
                })

                let dt:string;
                switch (si.daysType){
                    case DaysType.DaysOfWeek: { dt = 'daysOfWeek'; break; }
                    case DaysType.DaysOfMonth: { dt = 'daysOfMonth'; break; }
                }

                let mto = this.timeInfoToJson(si.mainTrigger);

                let sio = {
                    'id':si.id,
                    'daysType':dt,
                    'daysArg':si.daysArg,
                    'mainTrigger':mto,
                }

                let index = shedo.scheduleItems.push(sio)

                if (si.randomTrigger.used) { 
                    sio['randomTrigger'] = this.timeInfoToJson(si.randomTrigger);
                }
                if (si.triggerFirstOf.used) { 
                    sio['triggerFirstOf'] = this.timeInfoToJson(si.triggerFirstOf);
                }
                if (si.triggerLastOf.used) { 
                    sio['triggerLastOf'] = this.timeInfoToJson(si.triggerLastOf);
                }
                if (si.onlyTriggerIfBefore.used) {
                    sio['onlyTriggerIfBefore'] = this.timeInfoToJson(si.onlyTriggerIfBefore);
                }
                if (si.onlyTriggerIfAfter.used) {
                    sio['onlyTriggerIfAfter'] = this.timeInfoToJson(si.onlyTriggerIfAfter);

                }
                sio['tokenSetters']=tss;
            })
            localsettings.settings.schedules.push(shedo);
        })

        return JSON.stringify(localsettings);
    }

    timeInfoToJson(timeInfo:TimeInfo)
    {
        let res;
        if (timeInfo.timeType == TimeType.TimeOfDay) {
            res = {
                'timeType':this.timeTypeToStringVersion2(timeInfo.timeType),
                'time':timeInfo.time,
            }
        }
        if (timeInfo.timeType == TimeType.Solar) {
            res = {
                'timeType':this.timeTypeToStringVersion2(timeInfo.timeType),
                'sunEvent':timeInfo.sunEvent,
                'solarOffset':timeInfo.solarOffset,
            }
        }
        return res;
    }

    timeTypeToStringVersion2(tt:TimeType):string {
        if (tt==TimeType.TimeOfDay) return 'timeOfDay';
        else if (tt==TimeType.Solar) return 'solar';
    }

    readSettings(settings:string):number {
        let version = this.getSettingsVersion(settings);
        
        if (version == 1) {
            this.readSettingsVersion1(settings);
            return version;
        }
        else if (version == 2){
            this.readSettingsVersion2(settings);
            return version;
        }
        else {
            //create empty settings
            this.settings = new ASSettings();
            return -1;
        }
    }

    getSettingsVersion(settings:string):number {
        let rs = settings;

        if (rs == null) { 
            return -1;
        }

        let jsonsettings;
        try {
            jsonsettings = JSON.parse(rs);            
        } catch (error) {
            console.log('Error parsing settings version. Blank settings will be used. Error: ' + error);
            return -1;
        }
        if (jsonsettings == null) { 
            return -1;
        }

        let ver = jsonsettings.settingsVersion;
        if (ver === undefined) ver = 1;
        return ver;
    }

    readSettingsVersion1(settings:string):number {
        //if (this.homeyApp != null) this.homeyApp.log('Reading settings...');
        try {
            console.log('Reading settings version 1');
            let rs = settings;

            this.settings = new ASSettings();

            if (rs == null) { 
                //if (this.homeyApp != null) this.homeyApp.log('Settings not found, starting blank')
                return -1;
            }

            let jsonsettings = JSON.parse(rs);
            if (jsonsettings == null) { 
                //if (this.homeyApp != null) this.homeyApp.log('Settings not possible to parse, starting blank')
                return -1;
            }
    
            jsonsettings.settings.schedules.forEach(sched => {
                let localschedule = this.settings.addNewScheduleInternal(parseInt(sched.id),sched.name, Boolean(sched.active));
                console.log('Added schedule: ' + localschedule.id +  ' ' + localschedule.name );
                sched.tokens.forEach (token => {
                    let localtoken = new Token(localschedule, parseInt(token.id), token.name, token.type)   
                    //console.log('created token: ' + localtoken.id +  ' ' + localtoken.name );
                    localschedule.tokens.push(localtoken);            
                    //console.log('pushed token: ' + localtoken.id +  ' ' + localtoken.name );
                });    
                sched.scheduleitems.forEach(si => {
                    let dt:DaysType;
                    switch (si.daystype){
                        case 'daysofweek': { dt = DaysType.DaysOfWeek; break; }
                        case 'daysofmonth': { dt = DaysType.DaysOfMonth; break; }

                    }


                    let tt:TimeType;
                    let setype = '';
                    if (si.timetype == 'timeofday') { tt = TimeType.TimeOfDay; }
                    else if (si.timetype.search('solar:') > -1 ) { 
                        tt = TimeType.Solar; 
                        setype = si.timetype.replace('solar:','');
                    }

                    let timeArg = "00:00";
                    let solarOffset= "00:00";
                    if (tt == TimeType.TimeOfDay) timeArg = si.timearg; 
                    else if (tt == TimeType.Solar) solarOffset = si.timearg;
                    let localsi = new ScheduleItem(localschedule, parseInt(si.id), dt, si.daysarg, new TimeInfo(tt, timeArg, setype, solarOffset));
                    
                    si.tokensetters.forEach(ti => {
                        let localtoken = localschedule.tokens.find(t=>t.id==ti.id)
                        let localTokenSetter:TokenSetter;
                        if (localtoken.type == 'boolean') { localTokenSetter = new TokenSetter(localsi, localtoken,Boolean(ti.value)); }
                        else if (localtoken.type == 'string') { localTokenSetter = new TokenSetter(localsi, localtoken,ti.value); }
                        else if (localtoken.type == 'number') { localTokenSetter = new TokenSetter(localsi, localtoken,Number(ti.value)); }
                        else { 
                        //    if (this.homeyApp != null) this.homeyApp.log('Incorrect type for tokenSetter');
                            }

                        localsi.tokenSetters.push(localTokenSetter);
                    });

                    localschedule.scheduleItems.push(localsi);            
                });     
    
                //this.schedules.addNewSchedule(localschedule);
            });

            console.log('Settings v1 read');
                
        } catch (error) {
            console.log('Settings v1 NOT read!');
            console.log('Error: ' + error);
            return -1;
        }
        return this.settings.schedules.length;

    }
 
    readSettingsVersion2(settings:string):number {
        //if (this.homeyApp != null) this.homeyApp.log('Reading settings...');
        try {
            console.log('Reading settings version 2');

            let rs = settings;

            this.settings = new ASSettings();

            if (rs == null) { 
                //if (this.homeyApp != null) this.homeyApp.log('Settings not found, starting blank')
                return -1;
            }

            let jsonsettings = JSON.parse(rs);
            if (jsonsettings == null) { 
                //if (this.homeyApp != null) this.homeyApp.log('Settings not possible to parse, starting blank')
                return -1;
            }
            
            jsonsettings.settings.schedules.forEach(sched => {
                let localschedule = this.settings.addNewScheduleInternal(parseInt(sched.id),sched.name, Boolean(sched.active));
                console.log('Added schedule: ' + localschedule.id +  ' ' + localschedule.name );
                sched.tokens.forEach (token => {
                    let localtoken = new Token(localschedule, parseInt(token.id), token.name, token.type)   
                    //console.log('created token: ' + localtoken.id +  ' ' + localtoken.name );
                    localschedule.tokens.push(localtoken);            
                    //console.log('pushed token: ' + localtoken.id +  ' ' + localtoken.name );
                });    
                sched.scheduleItems.forEach(si => {
                    let dt:DaysType;
                    switch (si.daysType){
                        case 'daysOfWeek': { dt = DaysType.DaysOfWeek; break; }
                        case 'daysOfMonth': { dt = DaysType.DaysOfMonth; break; }
                    }

                    let mt = this.parseJsonTimeInfo(si.mainTrigger); 
                    let rt = this.parseJsonTimeInfo(si.randomTrigger);
                    let fo = this.parseJsonTimeInfo(si.triggerFirstOf);
                    let lo = this.parseJsonTimeInfo(si.triggerLastOf);
                    let ob = this.parseJsonTimeInfo(si.onlyTriggerIfBefore);
                    let oa = this.parseJsonTimeInfo(si.onlyTriggerIfAfter);

                    let localsi = new ScheduleItem(localschedule, parseInt(si.id), dt, si.daysArg, mt, rt, fo, lo, ob, oa);

                    si.tokenSetters.forEach(ti => {
                        let localtoken = localschedule.tokens.find(t=>t.id==ti.id)
                        let localTokenSetter:TokenSetter;
                        if (localtoken.type == 'boolean') { localTokenSetter = new TokenSetter(localsi, localtoken,Boolean(ti.value)); }
                        else if (localtoken.type == 'string') { localTokenSetter = new TokenSetter(localsi, localtoken,ti.value); }
                        else if (localtoken.type == 'number') { localTokenSetter = new TokenSetter(localsi, localtoken,Number(ti.value)); }
                        else { 
                        //    if (this.homeyApp != null) this.homeyApp.log('Incorrect type for tokenSetter');
                            }
                        //console.log('pushing setter');

                        localsi.tokenSetters.push(localTokenSetter);
                        //console.log('pushed setter');
                    });

                    //console.log('pushing si');
                    localschedule.scheduleItems.push(localsi);            
                    //console.log('pushed si');
                });     
    
            });

            console.log('Settings v2 read');
                
        } catch (error) {
            console.log('Settings v2 NOT read!');
            console.log('Error: ' + error);
            return -1;
        }
        return this.settings.schedules.length;

    }
 
    parseJsonTimeInfo(timeInfo:any):TimeInfo {
        //console.log('parse start');

        if (timeInfo === undefined) {
            //console.log('returning blank TimeInfo');
            return new TimeInfo(TimeType.TimeOfDay,"","","");
        }

        if (timeInfo.timeType == 'timeOfDay') {
            return new TimeInfo (TimeType.TimeOfDay, timeInfo.time, "", "");
        }
        else if (timeInfo.timeType == 'solar') {
            return new TimeInfo (TimeType.Solar, "", timeInfo.sunEvent, timeInfo.solarOffset);
        }
        else {
            console.log('Unknown timeType: ' + timeInfo.timeType)
            return null;
        }
    }
}



