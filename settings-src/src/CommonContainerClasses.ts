
export class ASSettings {
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
    constructor(settings:ASSettings, id:number, name:string, active:boolean){
        this.settings = settings;
        this.id=id;
        this.name=name;
        this.active=active;
        this.tokens = new Array<Token>();
        this.scheduleItems = new Array<ScheduleItem>();
    }

    settings:ASSettings;
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
        this.settings.schedules.forEach(s=> {
            s.tokens.forEach(token => {
                if (token.id > maxid) maxid = token.id;
            })
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
            if (token.id == id){
                var index = this.tokens.indexOf(token);
                if (index !== -1) {
                    this.tokens.splice(index, 1);
                    return true;
                }
            }
        })
        return false;
    }


    addNewScheduleItem(dayType:DaysType, daysArg:number, timeType:TimeType, sunEventType:string, timeArg:string):ScheduleItem{
        var maxid = 0;
        this.settings.schedules.forEach(s=> {
            s.scheduleItems.forEach(si => {
                if (si.id > maxid) maxid = si.id;
            })
        })
        return this.addNewScheduleItemInternal(maxid + 1, dayType, daysArg, timeType, sunEventType, timeArg)
    }

    addNewScheduleItemInternal(id: number, dayType:DaysType,
                daysArg:number,
                timeType:TimeType,
                sunEventType:string,
                timeArg:string):ScheduleItem{
        let newSI = new ScheduleItem(this, id, dayType, daysArg, new TimeInfo(timeType, sunEventType, timeArg, "00:00"));

        this.tokens.forEach(token=>{
            newSI.addNewTokenSetterByIdNoVal(token.id);
        })

        this.scheduleItems.push(newSI);

        return newSI;
    }


    deleteScheduleItem(id:number):boolean{
        this.scheduleItems.forEach(si => {
            if (si.id == id) {
                var index = this.scheduleItems.indexOf(si);
                if (index !== -1) {
                    this.scheduleItems.splice(index, 1);
                    return true;
                }
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
    constructor (day:string, shortDay:string, value:number){
        this.day=day;
        this.shortDay=shortDay;
        this.value=value;
    }
    day:string;
    shortDay:string;
    translatedDay:string;
    translatedShortDay:string;
    value:number;
}

export class TimeInfo{
    constructor (timeType:TimeType, time:string, sunEvent:string, solarOffset:string) {
        this.timeType = timeType;
        
        //cleaning
        if (time===undefined) time = "";
        if (sunEvent===undefined) sunEvent = "";
        if (solarOffset===undefined) solarOffset = "";

        this.time=time;
        this.sunEvent=sunEvent;
        this.solarOffset=solarOffset;
        this.used = time!="" || sunEvent!=""; 

        if (this.time == "") this.time="00:00";
        if (this.solarOffset == "") this.solarOffset="00:00";

        console.log('TimeInfo created: ' + this.timeType + ' ' + this.time + ' ' + this.sunEvent + ' ' + this.solarOffset);

    }

    used:boolean;
    timeType:TimeType;
    time:string;
    sunEvent:string;
    solarOffset:string

}



export class ScheduleItem {
    constructor(schedule:Schedule,
                id:number,
                daytype:DaysType,
                daysArg:number,
                
                mainTrigger:TimeInfo,
                randomTrigger:TimeInfo=null,
                triggerFirstOf:TimeInfo=null,
                triggerLastOf:TimeInfo=null,
                onlyTriggerIfBefore:TimeInfo=null,
                onlyTriggerIfAfter:TimeInfo=null,
    ) {

        this.schedule=schedule;

        this.id=id;
        this.daysType=daytype;
        this.daysArg=daysArg;
        
        this.mainTrigger=mainTrigger;
        if (randomTrigger==null) { randomTrigger = new TimeInfo(TimeType.TimeOfDay,"00:00","","00:00"); randomTrigger.used=false;}
        if (triggerFirstOf==null) { triggerFirstOf = new TimeInfo(TimeType.TimeOfDay,"00:00","","00:00"); triggerFirstOf.used=false;}
        if (triggerLastOf==null) { triggerLastOf = new TimeInfo(TimeType.TimeOfDay,"00:00","","00:00"); triggerLastOf.used=false;}
        if (onlyTriggerIfBefore==null) { onlyTriggerIfBefore = new TimeInfo(TimeType.TimeOfDay,"00:00","","00:00"); onlyTriggerIfBefore.used=false;}
        if (onlyTriggerIfAfter==null) { onlyTriggerIfAfter = new TimeInfo(TimeType.TimeOfDay,"00:00","","00:00"); onlyTriggerIfAfter.used=false;}

        this.randomTrigger=randomTrigger;
        this.triggerFirstOf=triggerFirstOf;
        this.triggerLastOf=triggerLastOf
        this.onlyTriggerIfBefore=onlyTriggerIfBefore;
        this.onlyTriggerIfAfter=onlyTriggerIfAfter;

        this.tokenSetters = new Array<TokenSetter>();
    }

    schedule:Schedule;
    id:number;
    daysType:DaysType;
  
    mainTrigger:TimeInfo;
    randomTrigger:TimeInfo;
    triggerFirstOf:TimeInfo;
    triggerLastOf:TimeInfo;
    onlyTriggerIfBefore:TimeInfo;
    onlyTriggerIfAfter:TimeInfo;

    tokenSetters:TokenSetter[];

    private internalSelectedDays:number[]

    delete(){
        this.schedule.deleteScheduleItem(this.id);
    }
    
/*    getAllDays(){
        if (this.allDays.length > 0) return this.allDays;

        var mo = new Day("Monday", "Mo", 1);
        var tu = new Day("Tuesday", "Tu", 2);
        var we = new Day("Wednesday", "We", 4);
        var th = new Day("Thursday", "Th", 8);
        var fr = new Day("Friday", "Fr", 16);
        var sa = new Day("Saturday", "Sa", 32);
        var su = new Day("Sunday", "Su", 64);

        this.allDays.push(mo, tu, we, th, fr, sa, su);

        return this.allDays;
    }
*/
    get daysArg():number{
        let res = 0;
        this.internalSelectedDays.forEach(d => {
            res+=Math.pow(2,d-1);
        });

        return res;
    }

    set daysArg(value:number){
        let arr:number[] = new Array();
        for (let i = 1; i<=7; i++) {
            if ((Math.pow(2,i-1) & value) != 0)
                arr.push(i);
        }
        this.internalSelectedDays = arr;
    }

    get selectedDays():number[] {
        return this.internalSelectedDays;
    }

    set selectedDays(value:number[]) {
        this.internalSelectedDays = value;
    }
    
    /* private updateSelectedDays(){
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
*/
 
/*    get selectedDays():Day[]{
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
*/
    addNewTokenSetter(token:Token, value:any):TokenSetter{
        return this.addNewTokenSetterInternal(token, value)
    }

    addNewTokenSetterByIdNoVal(tokenid:number):TokenSetter{
        this.schedule.tokens.forEach(token => {
            if (token.id == tokenid){
                if (token.type === 'string') return this.addNewTokenSetterInternal(token, '') 
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
            if (ts.token.id == tokenid) {
                var index = this.tokenSetters.indexOf(ts);
                if (index !== -1) {
                    this.tokenSetters.splice(index, 1);
                    return true;
                }
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

export class SolarInfo{
    constructor(id:string,desc:string){//,time:Date){
        this.id = id;
        this.desc = desc;
    }

    id:string;
    desc:string;
    time:Date;
}

//Todo: Merge this and root/src/Sunwrapper.ts
export class SunWrapper{
    getSunTimes(){
        return [ 
            new SolarInfo("dawn","Dawn" ),
            new SolarInfo("dusk","Dusk" ),
            new SolarInfo("goldenHourEveningStart","Evening Golden Hour Start" ),
            new SolarInfo("goldenHourMorningEnd","Morning Golden Hour End" ),
            new SolarInfo("nadir","Nadir" ),
            new SolarInfo("nauticalDawn","Nautical Dawn" ),
            new SolarInfo("nauticalDusk","Nautical Dusk" ),
            new SolarInfo("night","Night" ),
            new SolarInfo("nightEnd","Night End" ),
            new SolarInfo("solarNoon","Solar Noon" ),
            new SolarInfo("sunrise","Sunrise" ),
            new SolarInfo("sunriseEnd","Sunrise End" ),
            new SolarInfo("sunset","Sunset" ),
            new SolarInfo("sunsetStart","Sunset Start" ),
        ]
    }
}

  
