'use strict';

//const Homey = require('homey');
import { App as HomeyApp } from "homey";
import { MainApp as MainApp } from "./src/mainapp";


class AdvSchedulerApp extends HomeyApp {
  /**
   * onInit is called when the app is initialized.
   */ 
  async onInit() {
    // Start debuger
    if (process.env.DEBUG === '1') {
      require('inspector').open(9229, '0.0.0.0', false);
      //require(“inspector”).open(9229, “0.0.0.0”, true);
    }


    let ma = new MainApp(this);
    ma.init();
    this.log('Advanced Scheduler has been initialized');
  }
}

module.exports = AdvSchedulerApp;
