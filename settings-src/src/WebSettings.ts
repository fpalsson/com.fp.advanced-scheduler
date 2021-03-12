'use strict';

import { SendHandle } from "child_process";

export class WebSettings {
    
    public settings:Settings; //Lets expose it publicly for now, refactor later.

    constructor() {
        
    }
  
    

    getSettings():Settings{
        return this.settings;
    }

    buildSettings(settings:Settings) {
        let localsettings = {settings:{
                schedules:[]
            }
        }

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
                    case DaysType.DaysOfWeek: { dt = 'daysofweek'; break; }
                    case DaysType.DaysOfMonth: { dt = 'daysofmonth'; break; }
                }

                let tt:string;
                let setype:string;
                if (si.timeType == TimeType.TimeOfDay) { tt = 'timeofday'; }
                else if (si.timeType == TimeType.Solar) { 
                    tt = 'solar:' + si.sunEventType; 
                }

                jsonsched.scheduleitems.push({
                    'id':si.id,
                    'daystype':dt,
                    'daysarg':si.daysArg,
                    'timetype':tt,
                    'timearg':si.timeArg,
                    'tokensetters':tss,
                })
                
            })
            localsettings.settings.schedules.push(jsonsched);
            

        })

        return JSON.stringify(localsettings);
    }

    readSettings(settings:string):number {
        //if (this.homeyApp != null) this.homeyApp.log('Reading settings...');
        try {
            let rs = settings;

            if (rs == null) { 
                //if (this.homeyApp != null) this.homeyApp.log('Settings not found, starting blank')
                return -1;
            }

            let jsonsettings = JSON.parse(rs);
            if (jsonsettings == null) { 
                //if (this.homeyApp != null) this.homeyApp.log('Settings not possible to parse, starting blank')
                return -1;
            }
    
            this.settings = new Settings();
            
            jsonsettings.settings.schedules.forEach(sched => {
                let localschedule = this.settings.addNewScheduleInternal(parseInt(sched.id),sched.name, Boolean(sched.active));
                console.log('Added schedule: ' + localschedule.id +  ' ' + localschedule.name );
                sched.tokens.forEach (token => {
                    let localtoken = new Token(localschedule, parseInt(token.id), token.name, token.type)   
                    console.log('created token: ' + localtoken.id +  ' ' + localtoken.name );
                    localschedule.tokens.push(localtoken);            
                    console.log('pushed token: ' + localtoken.id +  ' ' + localtoken.name );
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

                    let localsi = new ScheduleItem(localschedule, parseInt(si.id), dt, si.daysarg, tt, setype, si.timearg);
                    
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

            console.log('Settings read');
                
        } catch (error) {
            console.log('Settings NOT read!');
            console.log('Error: ' + error);
            return -1;
        }
        return this.settings.schedules.length;

    }
 
    getSunTimes(){
        return [ 
            new TimeInfo("dawn","Dawn" ),
            new TimeInfo("dusk","Dusk" ),
            new TimeInfo("goldenHour","Golden Hour" ),
            new TimeInfo("goldenHourEnd","Golden Hour End" ),
            new TimeInfo("nadir","Nadir" ),
            new TimeInfo("nauticalDawn","Nautical Dawn" ),
            new TimeInfo("nauticalDusk","Nautical Dusk" ),
            new TimeInfo("night","Night" ),
            new TimeInfo("nightEnd","Night End" ),
            new TimeInfo("solarNoon","Solar Noon" ),
            new TimeInfo("sunrise","Sunrise" ),
            new TimeInfo("sunriseEnd","Sunrise End" ),
            new TimeInfo("sunset","Sunset" ),
            new TimeInfo("sunsetStart","Sunset Start" ),
        ]
    }


}



export class Settings {
    constructor(){
        this.schedules = new Array<Schedule>();
    }

    schedules:Array<Schedule>;

    addNewSchedule(name:string, active:boolean):Schedule{
        var maxid = 0;
        this.schedules.forEach(schedule => {
            if (schedule.id > maxid) maxid = schedule.id;
        })
        return this.addNewScheduleInternal(maxid + 1, name, active)
    }

    addNewScheduleInternal(id: number, name:string, active:boolean):Schedule{
        let newSchedule = new Schedule(this, id, name, active);
        this.schedules.push(newSchedule);
        return newSchedule;
    }


    deleteSchedule(id:number):boolean{
        this.schedules.forEach(schedule => {
            if (schedule.id == id) {
                var index = this.schedules.indexOf(schedule);
                if (index !== -1) {
                    this.schedules.splice(index, 1);
                    //console.log('Deleted schedule with id: ' + schedule.id)
                    return true;
                }
            }
        })
        return false;
    }


}


export class Schedule {
    constructor(settings:Settings, id:number, name:string, active:boolean){
        this.settings = settings;
        this.id=id;
        this.name=name;
        this.active=active;
        this.tokens = new Array<Token>();
        this.scheduleItems = new Array<ScheduleItem>();
    }

    settings:Settings;
    id:number;
    name:string;
    active:boolean;
    tokens:Token[];
    scheduleItems:ScheduleItem[];

    delete(){
        this.settings.deleteSchedule(this.id);
    }

    addNewToken(name:string, type: "boolean" | "number" | "string"):Token{
        var maxid = 0;
        this.tokens.forEach(token => {
            if (token.id > maxid) maxid = token.id;
        })
        return this.addNewTokenInternal(maxid + 1, name, type)
    }

    addNewTokenInternal(id: number, name:string, type: "boolean" | "number" | "string"):Token{
        let newToken = new Token(this, id, name, type);
        this.tokens.push(newToken);
        return newToken;
    }


    deleteToken(id:number):boolean{
        this.tokens.forEach(token => {
            if (token.id == id)
            var index = this.tokens.indexOf(token);
            if (index !== -1) {
                this.tokens.splice(index, 1);
                return true;
            }
        })
        return false;
    }


    addNewScheduleItem(dayType:DaysType, daysArg:number, timeType:TimeType, sunEventType:string, timeArg:string):ScheduleItem{
        var maxid = 0;
        this.scheduleItems.forEach(si => {
            if (si.id > maxid) maxid = si.id;
        })
        return this.addNewScheduleItemInternal(maxid + 1, dayType, daysArg, timeType, sunEventType, timeArg)
    }

    addNewScheduleItemInternal(id: number, dayType:DaysType,
                daysArg:number,
                timeType:TimeType,
                sunEventType:string,
                timeArg:string):ScheduleItem{
        let newSI = new ScheduleItem(this, id, dayType, daysArg, timeType, sunEventType, timeArg);

        this.tokens.forEach(token=>{
            newSI.addNewTokenSetterByIdNoVal(token.id);
        })

        this.scheduleItems.push(newSI);

        return newSI;
    }


    deleteScheduleItem(id:number):boolean{
        this.scheduleItems.forEach(si => {
            if (si.id == id)
                var index = this.scheduleItems.indexOf(si);
            if (index !== -1) {
                this.scheduleItems.splice(index, 1);
                return true;
            }
        })
        return false;
    }

}




export class Token {
    constructor(schedule:Schedule, id:number, name:string, type: "boolean" | "number" | "string"){
        this.schedule = schedule;
        this.id=id;
        this.name=name;
        this.type=type;
    }

    schedule:Schedule;
    id:number;
    name:string;
    type: "boolean" | "number" | "string" ;

    delete(){
        this.schedule.scheduleItems.forEach(si => {
            si.tokenSetters.forEach(ts => {
                if (ts.token.id==this.id){
                    si.deleteTokenSetter(this.id)
                }
            })
        })
        
        this.schedule.deleteToken(this.id);
    }
}

export enum DaysType {
    DaysOfWeek = 1,
    DaysOfMonth = 2
}

export enum TimeType {
    TimeOfDay = 1,
    Solar = 2
}

export class Day{
    constructor (day:string, value:number){
        this.day=day;
        this.value=value;
    }
    day:string;
    translatedDay:string;
    value:number;
}





export class ScheduleItem {
    constructor(schedule:Schedule,
                id:number,
                daytype:DaysType,
                daysArg:number,
                timeType:TimeType,
                sunEventType:string,
                timeArg:string){
        this.schedule=schedule;

        this.allDays = new Array();
        this.allDays=this.getAllDays();
        this.internalSelectedDays=new Array();

        this.id=id;
        this.daysType=daytype;
        this.daysArg=daysArg;
        this.timeType=timeType;
        this.timeArg=timeArg;
        this.sunEventType=sunEventType;
        this.tokenSetters = new Array<TokenSetter>();
        this.updateSelectedDays();
    }

    schedule:Schedule;
    id:number;
    daysType:DaysType;
    internalDaysArg:number // 0..127, monday is 1, tuesday is 2, wednesday is 4, thursday is 8 and so on;
    timeType:TimeType;
    sunEventType:string;
    timeArg:string;
    tokenSetters:TokenSetter[];
    private allDays:Day[];
    private internalSelectedDays:Day[];


    delete(){
        this.schedule.deleteScheduleItem(this.id);
    }
    
    getAllDays(){
        if (this.allDays.length > 0) return this.allDays;

        var mo = new Day("Monday", 1);
        var tu = new Day("Tuesday", 2);
        var we = new Day("Wednesday", 4);
        var th = new Day("Thursday", 8);
        var fr = new Day("Friday", 16);
        var sa = new Day("Saturday", 32);
        var su = new Day("Sunday", 64);

        this.allDays.push(mo, tu, we, th, fr, sa, su);

        return this.allDays;
    }

    get daysArg():number{
        return this.internalDaysArg;
    }

    set daysArg(value:number){
        //console.log('set daysarg');
        this.internalDaysArg=value;
        //console.log('set daysarg before update');
        this.updateSelectedDays();
        //console.log('set daysarg updated');
    }


    private updateSelectedDays(){
        //This takes care to not add or remove elements that are not needed to be added or removed, to make Vue work as expected!!!
        //console.log('updateSelectedDays current number: ' + this.internalSelectedDays.length);

        for (let i = 0; i < 7; i++)
        {
            let val:number = Math.pow(2,i);
            let shouldexist:boolean = (val & this.daysArg) > 0;
            let foundday:Day=null;
            this.internalSelectedDays.forEach(d => {
                if (d.value==val) foundday = d; 
            })

            //console.log('updateSelectedDays val:' + val + ' shouldexist:'+ shouldexist + ' foundday:' + foundday);

            if (shouldexist && foundday == null) {
                //add
                this.internalSelectedDays.push(this.allDays[i]);
                //console.log('updateSelectedDays added' + this.allDays[i].day + this.allDays[i].value);
            }
            if (!shouldexist && foundday != null) {
                //remove
                this.internalSelectedDays.splice(this.internalSelectedDays.indexOf(foundday),1);
                //console.log('updateSelectedDays removed ' + foundday.day );
            }
        }

        //console.log('updateSelectedDays' + this.internalSelectedDays);

    }

    get selectedDays():Day[]{
        console.log('get selectedDays'+ this.internalSelectedDays);

        return this.internalSelectedDays;
    }

    set selectedDays(value:Day[]){
        console.log('set selectedDays' + value);
        let daysArg:number=0;
        value.forEach(day=> {
            daysArg+=day.value;
            console.log('day' + day.value)
        })
        console.log('days' + daysArg)
        this.daysArg=daysArg;
    }

    addNewTokenSetter(token:Token, value:any):TokenSetter{
        return this.addNewTokenSetterInternal(token, value)
    }

    addNewTokenSetterByIdNoVal(tokenid:number):TokenSetter{
        this.schedule.tokens.forEach(token => {
            if (token.id == tokenid){
                if (token.type === 'string') return this.addNewTokenSetterInternal(token, 'Not set') 
                else if (token.type === 'number') return this.addNewTokenSetterInternal(token, 0) 
                else if (token.type === 'boolean') return this.addNewTokenSetterInternal(token, false) 
            }
        })
        return null;
    }

    addNewTokenSetterByIdWithVal(tokenid:number, value:any):TokenSetter{
        this.schedule.tokens.forEach(token => {
            if (token.id == tokenid){
                return this.addNewTokenSetterInternal(token, value)
            }
        })
        return null;
    }

    addNewTokenSetterInternal(token:Token, value:any):TokenSetter{
        let newTS = new TokenSetter(this, token, value);
        this.tokenSetters.push(newTS);
        return newTS;
    }

    deleteTokenSetter(tokenid):boolean{
        this.tokenSetters.forEach(ts => {
            if (ts.token.id == tokenid)
            var index = this.tokenSetters.indexOf(ts);
            if (index !== -1) {
                this.tokenSetters.splice(index, 1);
                return true;
            }
        })
        return false;
    }

}


export class TokenSetter {
    constructor(scheduleItem:ScheduleItem, token:Token, value:any) {
        this.scheduleItem=scheduleItem;
        this.token=token;
        this.value=value;
    }
    scheduleItem:ScheduleItem;

    token:Token;
    value:any;

    delete(){
        this.scheduleItem.deleteTokenSetter(this.token.id)
    }
}

export class TimeInfo{
    constructor(id:string,desc:string){//,time:Date){
        this.id = id;
        this.desc = desc;
  //      this.time = time;
    }

    id:string;
    desc:string;
//    time:Date;
// test
}
  

