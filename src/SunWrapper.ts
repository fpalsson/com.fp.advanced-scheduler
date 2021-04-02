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

    private internalGetTimes(date: Date){
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
        
        let times:SunCalc.GetTimesResult = SunCalc.getTimes(today,this.lat,this.lon);

        return [ new TimeInfo("dawn","Dawn", times.dawn ),
            new TimeInfo("dusk","Dusk", times.dusk ),
            new TimeInfo("goldenHourEveningStart","Evening Golden Hour Start", times.goldenHour ),
            new TimeInfo("goldenHourMorningEnd","Morning Golden Hour End", times.goldenHourEnd ),
            new TimeInfo("nadir","Nadir", times.nadir ),
            new TimeInfo("nauticalDawn","Nautical Dawn", times.nauticalDawn ),
            new TimeInfo("nauticalDusk","Nautical Dusk", times.nauticalDusk ),
            new TimeInfo("night","Night", times.night ),
            new TimeInfo("nightEnd","Night End", times.nightEnd ),
            new TimeInfo("solarNoon","Solar Noon", times.solarNoon ),
            new TimeInfo("sunrise","Sunrise", times.sunrise ),
            new TimeInfo("sunriseEnd","Sunrise End", times.sunriseEnd ),
            new TimeInfo("sunset","Sunset", times.sunset ),
            new TimeInfo("sunsetStart","Sunset Start", times.sunsetStart ),
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