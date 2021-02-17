'use strict';



class WebSettings {
    
    public schedules:Schedule[]; //Lets expose it publicly for now, refactor later.
    private internalsettings:string;

    constructor(settings:string) {
        this.internalsettings=settings;
    }
  
 

    getSchedules():Schedule[]{
        return this.schedules;
    }

    readSettings():number {
        //if (this.homeyApp != null) this.homeyApp.log('Reading settings...');
        try {
            let rs = this.internalsettings;

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
                    switch (si.timetype){
                        case 'timeofday': { tt = TimeType.TimeOfDay; break; }
                        case 'solar': { tt = TimeType.Solar; break; }
                    }
                    let localsi = new ScheduleItem(parseInt(si.id), dt, si.daysarg, tt, si.timearg);
                    
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
    }

    id:number;
    name:string;
    active:boolean;
    tokens:Token[];
    scheduleitems:ScheduleItem[];

}

class Token {
    constructor(id:number, name:string, type: "boolean" | "number" | "string"){
        this.id=id;
        this.name=name;
        this.type=type;
    }

    id:number;
    name:string;
    type: "boolean" | "number" | "string" ;
}

enum DaysType {
    DaysOfWeek,
    DaysOfMonth
}

enum TimeType {
    TimeOfDay,
    Solar
}

class ScheduleItem {
    constructor(id:number,
                daytype:DaysType,
                daysarg:number,
                timetype:TimeType,
                timearg:string){
        this.id=id;
        this.daystype=daytype;
        this.daysarg=daysarg;
        this.timetype=timetype;
        this.timearg=timearg;
        this.tokenitems = new Array();
    }

    id:number;
    daystype:DaysType;
    daysarg:number // 0..127, monday is 1, tuesday is 2 and so on;
    timetype:TimeType;
    timearg:string;
    tokenitems:TokenItem[];

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
    }

    token:Token;
    value:any;
}


  

