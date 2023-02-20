'use strict';

const Homey = require('homey');
import { MainApp as MainApp } from "./src/MainApp";

var SunCalc = require('suncalc');


class AdvSchedulerApp extends Homey.App {
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
