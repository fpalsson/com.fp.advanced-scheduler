'use strict';

import SunCalc = require('suncalc');


export class SunWrapper {
    private homey;
//    private homeyApp:HomeyApp;
    private homeyApp;
    private lat:number;
    private lon:number;

    constructor() {
        
      //  this.sunCalc = new SunCalc();
    }

//    init(homeyApp:HomeyApp) {
    init(homeyApp,lat,lon) {
        this.homeyApp=homeyApp;
        this.homey = this.homeyApp.homey;

        this.homeyApp.log('Advanced Scheduler SunWrapper is initializing...');

//        this.lat = ManagerGeolocation.getLatitude();
//        this.lon = ManagerGeolocation.getLongitude();
        this.lat = lat;
        this.lon = lon;

        this.homeyApp.log('Retreived latitude: ' + this.lat + '. Retreived longitude: ' + this.lon);

        //this.refreshTimes();
        this.addExtras();

        this.homeyApp.log('Advanced Scheduler SunWrapper has been initialized');
    }

    webInit(lat,lon) {
        this.lat = lat;
        this.lon = lon;

        this.addExtras();
    }

    addExtras() {
        SunCalc.addTime(-4, "goldenHourMorningStart","goldenHourEveningEnd");
        SunCalc.addTime(-4, "blueHourMorningEnd","blueHourEveningStart");
        SunCalc.addTime(-8, "blueHourMorningStart","blueHourEveningEnd");
        SunCalc.addTime(-18, "astronomicalDawn","astronomicalDusk");        
    }

    private getTimes(date: Date){
        var midday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
        
//        let times = SunCalc.getTimes(midday, this.lat, this.lon);        
        let times = SunCalc.getTimes(midday, this.lat, this.lon);        

        return [ 
            new SunEventInfo("nightEnd","Night End", times.nightEnd),
            new SunEventInfo("astronomicalDawn","Astronomical Dawn", times.astronomicalDawn),
            new SunEventInfo("nauticalDawn","Nautical Dawn", times.nauticalDawn),
            new SunEventInfo("blueHourMorningStart","Blue Hour Morning Start", times.blueHourMorningStart),
            new SunEventInfo("dawn","Dawn", times.dawn),
            new SunEventInfo("blueHourMorningEnd","Blue Hour Morning End", times.blueHourMorningEnd),
            new SunEventInfo("goldenHourMorningStart","Golden Hour Morning Start", times.goldenHourMorningStart),
            new SunEventInfo("sunrise","Sunrise", times.sunrise),
            new SunEventInfo("sunriseEnd","Sunrise End", times.sunriseEnd),
            new SunEventInfo("goldenHourMorningEnd","Morning Golden Hour End", times.goldenHourEnd),

            new SunEventInfo("solarNoon","Solar Noon", times.solarNoon),

            new SunEventInfo("goldenHourEveningStart","Evening Golden Hour Start", times.goldenHour),
            new SunEventInfo("sunsetStart","Sunset Start", times.sunsetStart),
            new SunEventInfo("sunset","Sunset", times.sunset),
            new SunEventInfo("goldenHourEveningEnd","Golden Hour Evening End", times.goldenHourEveningEnd),
            new SunEventInfo("blueHourEveningStart","Blue Hour Evening Start", times.blueHourEveningStart),
            new SunEventInfo("dusk","Dusk", times.dusk),
            new SunEventInfo("blueHourEveningEnd","Blue Hour Evening End", times.blueHourEveningEnd),
            new SunEventInfo("nauticalDusk","Nautical Dusk", times.nauticalDusk),
            new SunEventInfo("astronomicalDusk","Astronomical Dusk", times.astronomicalDusk),
            new SunEventInfo("night","Night", times.night),

            new SunEventInfo("nadir","Nadir", times.nadir),
            
            //New
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
        this.getTimes(date).forEach((timeinfo)=>{
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