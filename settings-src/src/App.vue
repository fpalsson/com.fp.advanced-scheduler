<template>
  <v-app>
    <v-main class="ma-1">
      <v-expansion-panels>
        <h1 style="text-align:left;">{{ $t('Schedules') }}</h1>
        <asv-schedule v-for="(schedule) in settings.schedules" :key="schedule.id" :schedule="schedule" :settings="settings" />
      </v-expansion-panels>
      <v-btn class="mt-2" color="green darken-1" text @click="addSchedule()"><v-icon dark>mdi-plus-circle-outline</v-icon> {{ $t('Add_new_schedule') }}</v-btn>
      <v-btn class="mt-2" color="green darken-1" text @click="saveSettings()"><v-icon dark>mdi-content-save</v-icon> {{ $t('Save_settings') }}</v-btn>

    </v-main>
  </v-app>
</template>

<script>
import { WebSettings, Schedule } from '@/WebSettings';
import AsvSchedule from '@/components/Schedule';
export default {
  name: 'App',
  components: {
    AsvSchedule

  },
  data() {
    return {
      settings: {
        schedules:{}
      }
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

          this.settings.schedules.push(new Schedule(maxid+1, this.$t('New_schedule'), true))        
      },

      saveSettings : function () {
          var ws = new WebSettings();
          var settings = ws.buildSettings(this.settings)
          
          console.log('Settings:');
          console.log(settings);
          
          this.Homey.set('settings', settings, function( err ){
              if( err ) return this.Homey.alert( err );
          });
      },

  }


};
</script>
