'use strict';

import { App as HomeyApp } from "homey";
import { Settings as AppSettings } from "./Settings";
import { FlowAndTokenHandler } from "./FlowAndTokenHandler";
import { TriggerHandler } from "./TriggerHandler";
import { ManagerSettings } from "homey";
import { SunWrapper } from "../src/SunWrapper";

export class MainApp {
    private homeyApp:HomeyApp;
    private settings:AppSettings;
    private flowAndTokenHandler:FlowAndTokenHandler;
    private triggerHandler:TriggerHandler;
    private sunWrapper:SunWrapper;
    
    constructor(homeyApp:HomeyApp) {
        this.homeyApp=homeyApp;
    }

    init() {

        this.homeyApp.log('Advanced Scheduler MainApp is initializing...');

        this.settings = new AppSettings(this.homeyApp);
        this.settings.readSettings();
       
        this.sunWrapper = new SunWrapper(this.homeyApp);
        this.sunWrapper.init();

        this.flowAndTokenHandler = new FlowAndTokenHandler(this.homeyApp,this.settings);
        this.flowAndTokenHandler.setupFlows();
        this.flowAndTokenHandler.setupTokens();

        this.triggerHandler = new TriggerHandler(this.homeyApp, this.settings, this.flowAndTokenHandler, this.sunWrapper);
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

        this.settings.readSettings();
       
        this.flowAndTokenHandler.setupTokens();

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
        this.homeyApp.log('Watching settings.');
    }
}