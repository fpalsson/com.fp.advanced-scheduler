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

        settings.schedules.forEach(schedule => {
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

            schedule.scheduleitems.forEach(si=>{
                let tis = new Array();
                si.tokenitems.forEach(ti=>{
                    tis.push({
                        'id':ti.token.id,
                        'value':ti.value,
                    })
                })

                let dt:string;
                switch (si.daystype){
                    case DaysType.DaysOfWeek: { dt = 'daysofweek'; break; }
                    case DaysType.DaysOfMonth: { dt = 'daysofmonth'; break; }
                }

                let tt:string;
                let setype:string;
                if (si.timetype == TimeType.TimeOfDay) { tt = 'timeofday'; }
                else if (si.timetype == TimeType.Solar) { 
                    tt = 'solar:' + si.suneventtype; 
                }

                jsonsched.scheduleitems.push({
                    'id':si.id,
                    'daystype':dt,
                    'daysarg':si.daysarg,
                    'timetype':tt,
                    'timearg':si.timearg,
                    'tokenitems':tis,
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
                    
                    si.tokenitems.forEach(ti => {
                        let localtoken = localschedule.tokens.find(t=>t.id==ti.id)
                        let localtokenitem:TokenItem;
                        if (localtoken.type == 'boolean') { localtokenitem = new TokenItem(localtoken,Boolean(ti.value)); }
                        else if (localtoken.type == 'string') { localtokenitem = new TokenItem(localtoken,ti.value); }
                        else if (localtoken.type == 'number') { localtokenitem = new TokenItem(localtoken,Number(ti.value)); }
                        else { 
                        //    if (this.homeyApp != null) this.homeyApp.log('Incorrect type for tokenitem');
                            }

                        localsi.tokenitems.push(localtokenitem);
                    });

                    localschedule.scheduleitems.push(localsi);            
                });     
    
                this.schedules.push(localschedule);
            });

            //if (this.homeyApp != null) this.homeyApp.log('Settings read');
                
        } catch (error) {
            //if (this.homeyApp != null) this.homeyApp.log('Settings NOT read!');
            //if (this.homeyApp != null) this.homeyApp.log('Error: ' + error);
            return -1;
        }
        return this.schedules.length;

    }
 
    getSunTimes(){
        return [ new TimeInfo("dawn","Dawn"),
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
        this.scheduleitems = new Array();
        //this.deletedialogopen=false;
    }

    id:number;
    name:string;
    active:boolean;
    tokens:Token[];
    scheduleitems:ScheduleItem[];
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
    value:number;
}

export class ScheduleItem {
    constructor(id:number,
                daytype:DaysType,
                daysarg:number,
                timetype:TimeType,
                suneventtype:string,
                timearg:string){

        this.allDays = new Array();
        this.allDays=this.getAllDays();
        this.internalSelectedDays=new Array();

        this.id=id;
        this.daystype=daytype;
        this.daysarg=daysarg;
        this.timetype=timetype;
        this.timearg=timearg;
        this.suneventtype=suneventtype;
        this.tokenitems = new Array();
        //this.deletedialogopen=false;
        //this.editdialogopen=false;
        this.updateSelectedDays();
    }

    id:number;
    daystype:DaysType;
    internaldaysarg:number // 0..127, monday is 1, tuesday is 2, wednesday is 4, thursday is 8 and so on;
    timetype:TimeType;
    suneventtype:string;
    timearg:string;
    tokenitems:TokenItem[];
    //deletedialogopen:boolean;
    //editdialogopen:boolean;
    private allDays:Day[];
    private internalSelectedDays:Day[];

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

    get daysarg():number{
        return this.internaldaysarg;
    }

    set daysarg(value:number){
        console.log('set daysarg');
        this.internaldaysarg=value;
        console.log('set daysarg before update');
        this.updateSelectedDays();
        console.log('set daysarg updated');
    }


    private updateSelectedDays(){
        //This takes care to not add or remove elements that are not needed to be added or removed, to make Vue work as expected!!!
        console.log('updateSelectedDays current number: ' + this.internalSelectedDays.length);

        for (let i = 0; i < 7; i++)
        {
            let val:number = Math.pow(2,i);
            let shouldexist:boolean = (val & this.daysarg) > 0;
            let foundday:Day=null;
            this.internalSelectedDays.forEach(d => {
                if (d.value==val) foundday = d; 
            })

            console.log('updateSelectedDays val:' + val + ' shouldexist:'+ shouldexist + ' foundday:' + foundday);

            if (shouldexist && foundday == null) {
                //add
                this.internalSelectedDays.push(this.allDays[i]);
                console.log('updateSelectedDays added' + this.allDays[i].day + this.allDays[i].value);
            }
            if (!shouldexist && foundday != null) {
                //remove
                this.internalSelectedDays.splice(this.internalSelectedDays.indexOf(foundday),1);
                console.log('updateSelectedDays removed ' + foundday.day );
            }
        }

        console.log('updateSelectedDays' + this.internalSelectedDays);

    }

    get selectedDays():Day[]{
        console.log('get selectedDays'+ this.internalSelectedDays);

        return this.internalSelectedDays;
    }

    set selectedDays(value:Day[]){
        console.log('set selectedDays' + value);
        let daysarg:number=0;
        value.forEach(day=> {
            daysarg+=day.value;
            console.log('day' + day.value)
        })
        console.log('days' + daysarg)
        this.daysarg=daysarg;
    }

    //Not so beutiful to have presentation logic here, but...
    get daysArgShortText():string {
        let da:number = this.daysarg;
        console.log('daysArgShortText daysarg: ' + da)
        if (da == 0) return "Nothing";
        else if (da == 1+2+4+8+16) return "Weekdays";
        else if (da == 32+64) return "Weekends";
        else if (da == 1+2+4+8+16+32+64) return "All week";
        else{
            //console.log('daysArgShortText daysarg2: ' + da)
            var s = '';
            if ((da & 1) > 0) s+='Mo,';
            if ((da & 2) > 0) s+='Tu,';
            if ((da & 4) > 0) s+='We,';
            if ((da & 8) > 0) s+='Th,';
            if ((da & 16) > 0) s+='Fr,';
            if ((da & 32) > 0) s+='Sa,';
            if ((da & 64) > 0) s+='Su,';
            //console.log('daysArgShortText daysarg3: ' + s)
            s = s.substring(0, s.length-1);
            return s;
        }
    }


}

export class TokenItem {
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
}
  

