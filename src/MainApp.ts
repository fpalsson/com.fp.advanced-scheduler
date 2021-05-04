'use strict';

import { App as HomeyApp, ManagerGeolocation } from "homey";

// this is copied from settings-src/src by build task. Not elegant, but...
import { ASSettings } from './CommonContainerClasses';
// this is copied from settings-src/src by build task. Not elegant, but...
import { SettingsPersistance } from './SettingsPersistance';

import { FlowAndTokenHandler } from "./FlowAndTokenHandler";
import { TriggerHandler } from "./TriggerHandler";
import { ManagerSettings } from "homey";
import { SunWrapper } from "./SunWrapper";

export class MainApp {
    private homeyApp:HomeyApp;
    private asSettings:ASSettings;
    private flowAndTokenHandler:FlowAndTokenHandler;
    private triggerHandler:TriggerHandler;
    private sunWrapper:SunWrapper;
    
    constructor(homeyApp:HomeyApp) {
        this.homeyApp=homeyApp;
    }

    init() {

        this.homeyApp.log('Advanced Scheduler MainApp is initializing...');

        let settingsTxt = ManagerSettings.get('settings');
        let sp = new SettingsPersistance();
        sp.readSettings(settingsTxt);
        this.asSettings = sp.getSettings();

        this.saveGeolocation();

        this.sunWrapper = new SunWrapper();
        this.sunWrapper.init(this.homeyApp, ManagerGeolocation.getLatitude(), ManagerGeolocation.getLongitude());

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

        let settingsTxt = ManagerSettings.get('settings');
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

        ManagerSettings.on('set', (variable) => {
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
            "latitude":ManagerGeolocation.getLatitude(), 
            "longitude":ManagerGeolocation.getLongitude()
        }
        
        ManagerSettings.set('geolocation', JSON.stringify(geo))
    }
}
