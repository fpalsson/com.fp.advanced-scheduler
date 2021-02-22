<template>
  <v-expansion-panel>
    <v-expansion-panel-header>{{ schedule.name }}, Active:{{ schedule.active }}</v-expansion-panel-header>
    <v-expansion-panel-content>
      <!--v-switch v-model="switch1" :label="`Switch 1: ${switch1.toString()}`" ></v-switch-->
       <v-container>
          <v-row no-gutters>
            <v-col cols="6">
              <v-text-field label="Schedule name" placeholder="Enter a schedule name" v-model="schedule.name"></v-text-field>
          </v-col>
            <v-col cols="4">
              <v-switch label="Active" v-model="schedule.active"></v-switch>
            </v-col>
            <v-col cols="2">
              <v-dialog v-model="deletedialogopen" > 
                <template v-slot:activator="{ on, attrs }">
                  <v-btn fab dark x-small color="red" v-bind="attrs" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn>
                </template>
                <v-card>
                  <v-card-title class="headline">Delete Schedule?</v-card-title>
                  <v-card-text>Do you want to delete schedule?</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="deletedialogopen = false">No</v-btn>
                    <v-btn color="red darken-1" text @click="scheduleDeleteAndCloseDialog(schedule.id)">Yes, delete</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-container>


      <v-expansion-panels>
        <v-expansion-panel>

          <v-expansion-panel-header>Tokens</v-expansion-panel-header>
          <v-expansion-panel-content>
            <asv-token v-for="(token) in schedule.tokens" :key="token.id" :token="token" :settings="settings"/>
              <v-btn color="green darken-1" text @click="addToken(schedule.id, 'boolean')">Add bool token</v-btn>
              <v-btn color="green darken-1" text @click="addToken(schedule.id, 'number')">Add number token</v-btn>
              <v-btn color="green darken-1" text @click="addToken(schedule.id, 'string')">Add string token</v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Schedule Items</v-expansion-panel-header>
          <v-expansion-panel-content>
            <asv-schedule-item v-for="(si) in schedule.scheduleitems" :key="si.id" :scheduleitem="si" :settings="settings"/>
            <v-btn color="green darken-1" text @click="addScheduleItem(schedule.id)">Add new schedule item</v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import AsvToken from '@/components/Token';
import AsvScheduleItem from '@/components/ScheduleItem';
import { Schedule, ScheduleItem, Token, DaysType, TimeType } from '../websettings'

export default {
  name: 'AsvSchedule',
  components: {
    AsvToken,
    AsvScheduleItem
  },
  props: {
    schedule: {
      type: Schedule,
      required: true
    },
    settings: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      deletedialogopen: false
    };
  },
  methods: {
    scheduleDeleteAndCloseDialog : function (scheduleid) {
      this.settings.schedules.forEach(schedule => {
          if (schedule.id == scheduleid) {
              var index = this.settings.schedules.indexOf(schedule);
              if (index !== -1) {
                  this.settings.schedules.splice(index, 1);
                  console.log('Deleted schedule with id: ' +schedule.id)
              }

          }
          this.deletedialogopen=false;
        })
      },

      addToken : function (scheduleid, type) {
        var maxid = 0;
        this.settings.schedules.forEach(schedule => {
            schedule.tokens.forEach(token => {
                if (token.id > maxid) maxid = token.id;
            })
        })

        this.settings.schedules.forEach(schedule => {
            if (schedule.id == scheduleid) {
                schedule.tokens.push(new Token(maxid+1, 'New token', type))        
            }
        })
      },
      
      addScheduleItem : function (scheduleid) {
        var maxid = 0;
        this.settings.schedules.forEach(schedule => {
            schedule.scheduleitems.forEach(si => {
                if (si.id > maxid) maxid = si.id;
            })
        })

        this.settings.schedules.forEach(schedule => {
            if (schedule.id == scheduleid) {
                console.log('before new si');
                let si = new ScheduleItem(maxid+1, DaysType.DaysOfWeek, 1+2+4+8+16+32+64, TimeType.TimeOfDay, '', '00:00')
                console.log('after  new si ' + si);
                //si.editdialogopen=true;
                schedule.scheduleitems.push(si)        
            }
        })
        
    },
       
  }

};
</script>
