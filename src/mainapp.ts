'use strict';

import { App as HomeyApp } from "homey";
import { Settings as AppSettings } from "../src/settings";
import { FlowAndTokenHandler } from "../src/flowandtokenhandler";
import { TriggerHandler } from "../src/triggerhandler";

export class MainApp {
    private homeyApp:HomeyApp;
    private settings:AppSettings;
    private flowAndTokenHandler:FlowAndTokenHandler;
    private triggerHandler:TriggerHandler;
    
    constructor(homeyApp:HomeyApp) {
        this.homeyApp=homeyApp;
    }

    init() {

        this.homeyApp.log('Advanced Scheduler MainApp is initializing...');

        this.settings = new AppSettings(this.homeyApp);
        this.settings.readSettings();
       
        this.flowAndTokenHandler = new FlowAndTokenHandler(this.homeyApp,this.settings);
        this.flowAndTokenHandler.setupFlowAndTokens();

        this.triggerHandler = new TriggerHandler(this.homeyApp, this.settings, this.flowAndTokenHandler);
        this.triggerHandler.setupTriggers('startup');
        this.triggerHandler.startTimer();

        this.homeyApp.log('Advanced Scheduler MainApp has been initialized');
  }
}

//module.exports = MainApp;