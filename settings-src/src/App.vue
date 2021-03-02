<template>
  <v-app>
    <v-main class="ma-1">
      <v-tabs
        v-model="tab"
        background-color="primary"
        dark
        next-icon="mdi-arrow-right-bold-box-outline"
        prev-icon="mdi-arrow-left-bold-box-outline"
        show-arrows
      >
        <v-tabs-slider color="yellow"></v-tabs-slider>
        <v-tab key="1">{{ $t('Schedules') }}</v-tab>
        <v-tab key="2">{{ $t('Raw_settings') }}</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item key="1">
          <v-expansion-panels>
            <!--h1 style="text-align:left;">{{ $t('Schedules') }}</h1-->
            <asv-schedule v-for="(schedule) in settings.schedules" :key="schedule.id" :schedule="schedule" :settings="settings" />
          </v-expansion-panels>
          <v-btn class="mt-2" color="green darken-1" text @click="addSchedule()"><v-icon dark>mdi-plus-circle-outline</v-icon> {{ $t('Add_new_schedule') }}</v-btn>
          <v-btn class="mt-2" color="green darken-1" text @click="saveSettings()"><v-icon dark>mdi-content-save</v-icon> {{ $t('Save_settings') }}</v-btn>
        </v-tab-item>
        <v-tab-item key="2">
          <v-textarea
            solo
            :label="$t('Raw_settings')"
            v-model="rawSettings"
          ></v-textarea>
          <div>Can be used to backup and restore settings (by copying or pasting settings here). <br>
            Be careful if pasting settings and saving them. Current settings will be erased!</div>

          <v-btn class="mt-2" color="green darken-1" text @click="getRawSettings()"><v-icon dark>mdi-download-circle-outline</v-icon> {{ $t('Get_raw_settings') }}</v-btn>
          <v-btn class="mt-2" color="green darken-1" text @click="saveRawSettings()"><v-icon dark>mdi-content-save</v-icon> {{ $t('Save_raw_settings_reload_needed') }}</v-btn>
        </v-tab-item>
      </v-tabs-items>
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
      },
      tab: null,
      rawSettings:''
    };
  },
  mounted() {
    this.settings.schedules = new Array();
    this.Homey.get('settings')
    .then(settings => {
      let ws = new WebSettings();
      ws.readSettings(settings);
      let schedules = ws.getSchedules();
      this.settings.schedules = schedules;
    })
    .catch(err => {
        this.Homey.alert(err);
    })
        
    let language = 'en';
    this.Homey.getLanguage()
    .then( lang => {
      console.log ('lang then: ' + lang);
      if (lang == 'sv' || 
          lang == 'de') {
            language = lang;
      }

      this.$i18n.locale = language;
    })
    .catch(err => {
        this.Homey.alert(err);
    })

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

      saveRawSettings : function () {
          this.Homey.set('settings', this.rawSettings, function( err ){
              if( err ) return this.Homey.alert( err );
          });
      },

      getRawSettings : function () {
          var ws = new WebSettings();
          var settings = ws.buildSettings(this.settings)
          
          console.log('Settings:');
          console.log(settings);

          this.rawSettings = settings;
      },
  }
};
</script>
