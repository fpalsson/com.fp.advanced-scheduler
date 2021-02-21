<template>
  <v-app>
    <v-main>
      <v-expansion-panels>
        <!--ul>
          <li v-for="schedule in settings.schedules" :key="schedule.id" > 
            {{schedule.name}}
          </li>
        </ul-->


        <schedule-v v-for="schedule in settings.schedules" :key="schedule.id" :schedule="schedule" />
      <v-expansion-panels>
      <v-btn color="green darken-1" text @click="addSchedule()">Add new schedule</v-btn>
      <v-btn color="green darken-1" text @click="saveSettings()">Save settings</v-btn>

    </v-main>
  </v-app>
</template>

<script>
'use strict'
import { WebSettings, Schedule } from './websettings';
import { ScheduleV } from '@/components/ScheduleV';
export default {
  name: 'App',
  components: {
    ScheduleV
  },
  data() {
    return {
      settings: {
        schedules:[]
      },
    };
  },
  mounted() {
    this.Homey.get('settings', (err, settings) => {
      if (err) return this.Homey.alert(err);
      //this.settings = JSON.parse(settings).settings;
      let ws = new WebSettings();
      ws.readSettings(settings);
      this.settings.schedules = ws.getSchedules();
    });
  },
  methods: {
      addSchedule : function () {
          var maxid = 0;
          this.settings.schedules.forEach(schedule => {
              if (schedule.id > maxid) maxid = schedule.id;
          })

          this.settings.schedules.push(new Schedule(maxid+1, 'New Schedule', true))        
      },

      saveSettings : function () {
          var ws = new WebSettings();
          var settings = ws.buildSettings(this.settings.schedules)
          
          console.log('Settings:');
          console.log(settings);
          
          this.Homey.set('settings', settings, function( err ){
              if( err ) return this.Homey.alert( err );
          });
      },

  }


};
</script>
