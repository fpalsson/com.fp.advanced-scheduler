'use strict';



export class Schedule {
    constructor(id:number, name:string, active:boolean){
        this.id=id;
        this.name=name;
        this.active=active;
        this.tokens = new Array();
        this.scheduleItems = new Array();
    }

    id:number;
    name:string;
    active:boolean;
    tokens:Token[];
    scheduleItems:ScheduleItem[];

}



export class Token {
    constructor(id:number, name:string, type: "boolean" | "number" | "string"){
        this.id=id;
        this.name=name;
        this.type=type;
    }

    id:number;
    name:string;
    type: "boolean" | "number" | "string" ;
}

export enum DaysType {
    DaysOfWeek,
    DaysOfMonth
}

export enum TimeType {
    TimeOfDay,
    Solar
}

export class ScheduleItem {
    constructor(id:number,
                dayType:DaysType,
                daysArg:number,
                timeType:TimeType,
                sunEventType:string,
                timeArg:string){
        this.id=id;
        this.daysType=dayType;
        this.daysArg=daysArg;
        this.timeType=timeType;
        this.sunEventType=sunEventType;
        this.timeArg=timeArg;
        this.tokenSetters = new Array();
    }
 
    id:number;
    daysType:DaysType;
    daysArg:number // 0..127, monday is 1, tuesday is 2 and so on;
    timeType:TimeType;
    sunEventType:string;
    timeArg:string;
    tokenSetters:TokenSetter[];
}

export class TokenSetter {
    constructor(token:Token, value:any) {
        this.token=token;
        this.value=value;
    }

    token:Token;
    value:any;
}


  
