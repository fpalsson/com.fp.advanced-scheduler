'use strict';

class WebSettings {
    
    public schedules:Schedule[]; //Lets expose it publicly for now, refactor later.

    constructor() {
        
    }
  
    

    getSchedules():Schedule[]{
        return this.schedules;
    }

    buildSettings(schedules:Schedule[]):string {
        let settings = {settings:{
                schedules:[]
            }
        }

        schedules.forEach(schedule => {
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
            settings.settings.schedules.push(jsonsched);
            

        })

        return JSON.stringify(settings);
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
  
}

class Schedule {
    constructor(id:number, name:string, active:boolean){
        this.id=id;
        this.name=name;
        this.active=active;
        this.tokens = new Array();
        this.scheduleitems = new Array();
        this.deletedialogopen=false;
    }

    id:number;
    name:string;
    active:boolean;
    tokens:Token[];
    scheduleitems:ScheduleItem[];
    deletedialogopen:boolean;

}

class Token {
    constructor(id:number, name:string, type: "boolean" | "number" | "string"){
        this.id=id;
        this.name=name;
        this.type=type;
        this.deletedialogopen=false;
    }

    id:number;
    name:string;
    type: "boolean" | "number" | "string" ;
    deletedialogopen:boolean;
}

enum DaysType {
    DaysOfWeek = 1,
    DaysOfMonth = 2
}

enum TimeType {
    TimeOfDay = 1,
    Solar = 2
}



class ScheduleItem {
    constructor(id:number,
                daytype:DaysType,
                daysarg:number,
                timetype:TimeType,
                suneventtype:string,
                timearg:string){
        this.id=id;
        this.daystype=daytype;
        this.daysarg=daysarg;
        this.timetype=timetype;
        this.timearg=timearg;
        this.suneventtype=suneventtype;
        this.tokenitems = new Array();
        this.deletedialogopen=false;
        this.editdialogopen=false;
    }

    id:number;
    daystype:DaysType;
    daysarg:number // 0..127, monday is 1, tuesday is 2, wednesday is 4, thursday is 8 and so on;
    timetype:TimeType;
    suneventtype:string;
    timearg:string;
    tokenitems:TokenItem[];
    deletedialogopen:boolean;
    editdialogopen:boolean;

    get daysArgText(){
        if (this.daysarg == 0) return "Nothing";
        else if (this.daysarg == 1+2+4+8+16) return "Weekdays";
        else if (this.daysarg == 32+64) return "Weekends";
        else if (this.daysarg == 1+2+4+8+16+32+64) return "All week";
        else{
            var s = '';
            if (this.daysarg && 1 > 0) s+='Mo,';
            if (this.daysarg && 2 > 0) s+='Tu,';
            if (this.daysarg && 4 > 0) s+='We,';
            if (this.daysarg && 8 > 0) s+='Th,';
            if (this.daysarg && 16 > 0) s+='Fr,';
            if (this.daysarg && 32 > 0) s+='Sa,';
            if (this.daysarg && 64 > 0) s+='Su,';
            return s;
        }
    }
}

class TokenItem {
    constructor(token:Token, value:any) {
        this.token=token;
        this.value=value;
        this.deletedialogopen=false;
    }

    token:Token;
    value:any;
    deletedialogopen:boolean;
}


  

