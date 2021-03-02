'use strict';

export class WebSettings {
    
    public schedules:Schedule[]; //Lets expose it publicly for now, refactor later.

    constructor() {
        
    }
  
    

    getSchedules():Schedule[]{
        return this.schedules;
    }

    buildSettings(settings) {
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
    
            this.schedules = new Array();
            
            jsonsettings.settings.schedules.forEach(sched => {
                let localschedule = new Schedule(parseInt(sched.id),sched.name, Boolean(sched.active));
                sched.tokens.forEach (token => {
                    let localtoken = new Token(parseInt(token.id), token.name, token.type)   
                    localschedule.tokens.push(localtoken);            
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

                    let localsi = new ScheduleItem(parseInt(si.id), dt, si.daysarg, tt, setype, si.timearg);
                    
                    si.tokensetters.forEach(ti => {
                        let localtoken = localschedule.tokens.find(t=>t.id==ti.id)
                        let localTokenSetter:TokenSetter;
                        if (localtoken.type == 'boolean') { localTokenSetter = new TokenSetter(localtoken,Boolean(ti.value)); }
                        else if (localtoken.type == 'string') { localTokenSetter = new TokenSetter(localtoken,ti.value); }
                        else if (localtoken.type == 'number') { localTokenSetter = new TokenSetter(localtoken,Number(ti.value)); }
                        else { 
                        //    if (this.homeyApp != null) this.homeyApp.log('Incorrect type for tokenSetter');
                            }

                        localsi.tokenSetters.push(localTokenSetter);
                    });

                    localschedule.scheduleItems.push(localsi);            
                });     
    
                this.schedules.push(localschedule);
            });

            console.log('Settings read');
                
        } catch (error) {
            console.log('Settings NOT read!');
            console.log('Error: ' + error);
            return -1;
        }
        return this.schedules.length;

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

export class Schedule {
    constructor(id:number, name:string, active:boolean){
        this.id=id;
        this.name=name;
        this.active=active;
        this.tokens = new Array();
        this.scheduleItems = new Array();
        //this.deletedialogopen=false;
    }

    id:number;
    name:string;
    active:boolean;
    tokens:Token[];
    scheduleItems:ScheduleItem[];
    //deletedialogopen:boolean;

}

export class Token {
    constructor(id:number, name:string, type: "boolean" | "number" | "string"){
        this.id=id;
        this.name=name;
        this.type=type;
        //this.deletedialogopen=false;
    }

    id:number;
    name:string;
    type: "boolean" | "number" | "string" ;
    //deletedialogopen:boolean;
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
    constructor(id:number,
                daytype:DaysType,
                daysArg:number,
                timeType:TimeType,
                sunEventType:string,
                timeArg:string){

        this.allDays = new Array();
        this.allDays=this.getAllDays();
        this.internalSelectedDays=new Array();

        this.id=id;
        this.daysType=daytype;
        this.daysArg=daysArg;
        this.timeType=timeType;
        this.timeArg=timeArg;
        this.sunEventType=sunEventType;
        this.tokenSetters = new Array();
        //this.deletedialogopen=false;
        //this.editdialogopen=false;
        this.updateSelectedDays();
    }

    id:number;
    daysType:DaysType;
    internalDaysArg:number // 0..127, monday is 1, tuesday is 2, wednesday is 4, thursday is 8 and so on;
    timeType:TimeType;
    sunEventType:string;
    timeArg:string;
    tokenSetters:TokenSetter[];
    //deletedialogopen:boolean;
    //editdialogopen:boolean;
    private allDays:Day[];
    private internalSelectedDays:Day[];

    //A bit ugly to do translation here, but...
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

}

export class TokenSetter {
    constructor(token:Token, value:any) {
        this.token=token;
        this.value=value;
        //this.deletedialogopen=false;
    }

    token:Token;
    value:any;
   // deletedialogopen:boolean;
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
  

