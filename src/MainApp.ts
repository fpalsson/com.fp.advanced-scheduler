'use strict';

import { App as HomeyApp } from "homey";

// this is copied from settings-src/src by build task. Not elegant, but...
import { ASSettings } from './CommonContainerClasses';
// this is copied from settings-src/src by build task. Not elegant, but...
import { SettingsPersistance } from './SettingsPersistance';

import { FlowAndTokenHandler } from "./FlowAndTokenHandler";
import { TriggerHandler } from "./TriggerHandler";

import { SunWrapper } from "./SunWrapper";

export class MainApp {
    private homeyApp:HomeyApp;
    private homey;
    private asSettings:ASSettings;
    private flowAndTokenHandler:FlowAndTokenHandler;
    private triggerHandler:TriggerHandler;
    private sunWrapper:SunWrapper;
    
    constructor(homeyApp:HomeyApp) {
        this.homeyApp=homeyApp;
        this.homey = this.homeyApp.homey;
    }

    init() {

        this.homeyApp.log('Advanced Scheduler MainApp is initializing...');

        let settingsTxt = this.homey.settings.get('settings');
        let sp = new SettingsPersistance();
        let version = sp.readSettings(settingsTxt);
        this.homeyApp.log('version', version);
        this.asSettings = sp.getSettings();

        this.saveGeolocation();

        this.sunWrapper = new SunWrapper();
        this.sunWrapper.init(this.homeyApp,this.homey.geolocation.getLatitude(), this.homey.geolocation.getLongitude());

        this.flowAndTokenHandler = new FlowAndTokenHandler(this.homeyApp, this.asSettings.schedules);
        this.flowAndTokenHandler.setupFlows();
        this.flowAndTokenHandler.setupTokens();

        this.triggerHandler = new TriggerHandler(this.homeyApp, this.asSettings, this.flowAndTokenHandler, this.sunWrapper);
        this.triggerHandler.setupTriggers('startup');
        this.triggerHandler.startTimer();

        this.watchsettings();

        //let ws = new WebSettings();
        //this.homeyApp.log(ws.test());

        this.homeyApp.log('Advanced Scheduler MainApp has been initialized');
    }


    reinit() {

        this.homeyApp.log('Advanced Scheduler MainApp is reinitializing...');

        this.triggerHandler.stopTimer();

        let settingsTxt = this.homey.settings.get('settings');
        let sp = new SettingsPersistance();
        sp.readSettings(settingsTxt);
        this.asSettings = sp.getSettings();
        
        this.flowAndTokenHandler.setSchedules(this.asSettings.schedules);
        this.flowAndTokenHandler.setupTokens();

        this.triggerHandler = new TriggerHandler(this.homeyApp, this.asSettings, this.flowAndTokenHandler, this.sunWrapper);
        this.triggerHandler.setupTriggers('startup');
        this.triggerHandler.startTimer();

        this.homeyApp.log('Advanced Scheduler MainApp has been reinitialized');
    }

    private watchsettings(){
        this.homeyApp.log('Soon watching settings.');

        this.homey.settings.on('set', (variable) => {
            if ( variable === 'settings' ) {
                this.homeyApp.log('SettingsWatcher notised settings change. Reinitializing!');
                this.reinit();
            }
        });

        //this.homeyApp.

        this.homeyApp.log('Watching settings.');
    }

    private saveGeolocation() {
        let geo = {
            "latitude":this.homey.geolocation.getLatitude(), 
            "longitude":this.homey.geolocation.getLongitude()
        }
        
        this.homey.settings.set('geolocation', JSON.stringify(geo))
    }
}
