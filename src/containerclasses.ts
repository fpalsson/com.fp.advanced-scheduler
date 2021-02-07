'use strict';



export class Schedule {
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
                daytype:DaysType,
                daysarg:number,
                timetype:TimeType,
                timearg:string){
        this.id=id;
        this.daytype=daytype;
        this.daysarg=daysarg;
        this.timetype=timetype;
        this.timearg=timearg;
        this.tokenitems = new Array();
    }

    id:number;
    daytype:DaysType;
    daysarg:number // 0..127, monday is 1, tuesday is 2 and so on;
    timetype:TimeType;
    timearg:string;
    tokenitems:TokenItem[];
}

export class TokenItem {
    constructor(token:Token, value:any) {
        this.token=token;
        this.value=value;
    }

    token:Token;
    value:any;
}


  