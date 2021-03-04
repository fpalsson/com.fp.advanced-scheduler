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
        <v-tab key="schedules">{{ $t('Schedules') }}</v-tab>
        <v-tab key="help">{{ $t('Help') }}</v-tab>
        <v-tab key="rawsettings">{{ $t('Raw_settings') }}</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item key="schedules">
          <v-expansion-panels>
            <!--h1 style="text-align:left;">{{ $t('Schedules') }}</h1-->
            <asv-schedule v-for="(schedule) in settings.schedules" :key="schedule.id" :schedule="schedule" :settings="settings" />
          </v-expansion-panels>
          <v-btn class="mt-2" color="green darken-1" text @click="addSchedule()"><v-icon dark>mdi-plus-circle-outline</v-icon> {{ $t('Add_new_schedule') }}</v-btn>
          <v-btn class="mt-2" color="green darken-1" text @click="saveSettings()"><v-icon dark>mdi-content-save</v-icon> {{ $t('Save_settings') }}</v-btn>
        </v-tab-item>
        <v-tab-item key="help">
          

          <!--v-btn class="mt-2" color="blue" text @click="helpUrl = 'https://fpalsson.github.io/com.fp.advanced-scheduler/'"><v-icon dark>mdi-help-circle-outline</v-icon> {{ $t('Help') }}</v-btn>
          <v-container class="ma-0 pa-0">
            <iframe :src="helpUrl" 
              style="position: fixed;
                      border: none;
                      margin: 0;
                      padding: 0;
                      z-index: 999999;
                      height: 100%;"
            ></iframe> 
            <iframe :src="helpUrl" 
                onload='javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight+"px";}(this));' 
                style="height:200px;width:100%;border:none;overflow:hidden;"></iframe>
          </v-container-->
          <p>
              Pressing any of these links will leave settings, save changes first!
          </p>
          <p>
            <a href="https://fpalsson.github.io/com.fp.advanced-scheduler/" target="_blank">Help page</a>
          </p>
          <p>
            <a href="https://community.athom.com/t/app-advanced-scheduler/43767" target="_blank">Community page</a>
          </p>
          
        </v-tab-item>
        <v-tab-item key="rawsettings">
          <v-textarea
            solo
            :label="$t('Raw_settings')"
            v-model="rawSettings"
          ></v-textarea>
          <div v-html="$t('Raw_settings_long_description')"></div>

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
      rawSettings:'',
      helpUrl:''
    };
  },
  mounted() {
    
    this.Homey.get('settings')
    .then(settings => {
      let ws = new WebSettings();
      ws.readSettings(settings);
      let schedules = ws.getSchedules();
      if (schedules != null)
        this.settings.schedules = schedules;
      else
        this.settings.schedules = new Array();
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
