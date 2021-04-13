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


    //should be refactored so that we do not need 
    private internalGetTimes(date: Date){
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
        
        let times:SunCalc.GetTimesResult = SunCalc.getTimes(today,this.lat,this.lon);

        return [ new SunEventInfo("dawn","Dawn", times.dawn ),
            new SunEventInfo("dusk","Dusk", times.dusk ),
            new SunEventInfo("goldenHourEveningStart","Evening Golden Hour Start", times.goldenHour ),
            new SunEventInfo("goldenHourMorningEnd","Morning Golden Hour End", times.goldenHourEnd ),
            new SunEventInfo("nadir","Nadir", times.nadir ),
            new SunEventInfo("nauticalDawn","Nautical Dawn", times.nauticalDawn ),
            new SunEventInfo("nauticalDusk","Nautical Dusk", times.nauticalDusk ),
            new SunEventInfo("night","Night", times.night ),
            new SunEventInfo("nightEnd","Night End", times.nightEnd ),
            new SunEventInfo("solarNoon","Solar Noon", times.solarNoon ),
            new SunEventInfo("sunrise","Sunrise", times.sunrise ),
            new SunEventInfo("sunriseEnd","Sunrise End", times.sunriseEnd ),
            new SunEventInfo("sunset","Sunset", times.sunset ),
            new SunEventInfo("sunsetStart","Sunset Start", times.sunsetStart ),
        ]


    }

    //getTimes() {

        //this.homeyApp.log('Advanced Scheduler MainApp is reinitializing...');
    //    return this.timeInfos;
        //this.homeyApp.log('Advanced Scheduler MainApp has been reinitialized');
    //}

    getTime(date:Date, sunEvent:string):SunEventInfo {
        let result:SunEventInfo;
        //this.homeyApp.log('Advanced Scheduler MainApp is reinitializing...');
        this.internalGetTimes(date).forEach((timeinfo)=>{
            //this.homeyApp.log('Checking: ' + timeinfo.id);
            if (timeinfo.id == sunEvent) {
                result = timeinfo;
            }
        })
        return result;
        //this.homeyApp.log('Advanced Scheduler MainApp has been reinitialized');
    }

}

export class SunEventInfo{
    constructor(id:string,desc:string,time:Date){
        this.id = id;
        this.desc = desc;
        this.time = time;
    }

    id:string;
    desc:string;
    time:Date;
}