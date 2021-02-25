'use strict';

import { App as HomeyApp } from "homey";
import { ManagerGeolocation } from "homey";
//import { SunCalc } from "suncalc";
import SunCalc = require('suncalc');
//import * as SunCalc from "suncalc";


export class SunWrapper {
    private homeyApp:HomeyApp;
    private lat:number;
    private lon:number;
    private times:SunCalc.GetTimesResult;
    //private timeInfos:TimeInfo[];

    constructor(homeyApp:HomeyApp) {
        this.homeyApp=homeyApp;
      //  this.sunCalc = new SunCalc();
    }

    init() {

        this.homeyApp.log('Advanced Scheduler SunWrapper is initializing...');

        this.lat = ManagerGeolocation.getLatitude();
        this.lon = ManagerGeolocation.getLongitude();

        this.homeyApp.log('Retreived latitude: ' + this.lat + '. Retreived longitude: ' + this.lon);

        //this.refreshTimes();

        this.homeyApp.log('Advanced Scheduler SunWrapper has been initialized');
    }

    internalGetTimes(date: Date){
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
	        
        this.times = SunCalc.getTimes(today,this.lat,this.lon);

        return [ new TimeInfo("dawn","Dawn", this.times.dawn ),
            new TimeInfo("dusk","Dusk", this.times.dusk ),
            new TimeInfo("goldenHour","Golden Hour", this.times.goldenHour ),
            new TimeInfo("goldenHourEnd","Golden Hour End", this.times.goldenHourEnd ),
            new TimeInfo("nadir","Nadir", this.times.nadir ),
            new TimeInfo("nauticalDawn","Nautical Dawn", this.times.nauticalDawn ),
            new TimeInfo("nauticalDusk","Nautical Dusk", this.times.nauticalDusk ),
            new TimeInfo("night","Night", this.times.night ),
            new TimeInfo("nightEnd","Night End", this.times.nightEnd ),
            new TimeInfo("solarNoon","Solar Noon", this.times.solarNoon ),
            new TimeInfo("sunrise","Sunrise", this.times.sunrise ),
            new TimeInfo("sunriseEnd","Sunrise End", this.times.sunriseEnd ),
            new TimeInfo("sunset","Sunset", this.times.sunset ),
            new TimeInfo("sunsetStart","Sunset Start", this.times.sunsetStart ),
        ]


    }

    //getTimes() {

        //this.homeyApp.log('Advanced Scheduler MainApp is reinitializing...');
    //    return this.timeInfos;
        //this.homeyApp.log('Advanced Scheduler MainApp has been reinitialized');
    //}

    getTime(date:Date, timeid:string):TimeInfo {
        let result:TimeInfo;
        //this.homeyApp.log('Advanced Scheduler MainApp is reinitializing...');
        this.internalGetTimes(date).forEach((timeinfo)=>{
            //this.homeyApp.log('Checking: ' + timeinfo.id);
            if (timeinfo.id == timeid) {
                result = timeinfo;
            }
        })
        return result;
        //this.homeyApp.log('Advanced Scheduler MainApp has been reinitialized');
    }

}

export class TimeInfo{
    constructor(id:string,desc:string,time:Date){
        this.id = id;
        this.desc = desc;
        this.time = time;
    }

    id:string;
    desc:string;
    time:Date;
}