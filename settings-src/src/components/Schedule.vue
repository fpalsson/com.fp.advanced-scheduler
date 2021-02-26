<template>
  <v-expansion-panel>
    <v-expansion-panel-header>{{ schedule.name }}, Active:{{ schedule.active }}</v-expansion-panel-header>
    <v-expansion-panel-content>
      <!--v-switch v-model="switch1" :label="`Switch 1: ${switch1.toString()}`" ></v-switch-->
       <v-container class="px-0">
          <v-row no-gutters>
            <v-col cols="6">
              <v-text-field label="Schedule name" placeholder="Enter a schedule name" hide-details="auto" v-model="schedule.name" :rules="rules.requiredText"></v-text-field>
          </v-col>
            <v-col cols="4">
              <v-switch label="Active" v-model="schedule.active"></v-switch>
            </v-col>
            <v-col cols="2">
              <v-dialog v-model="deletedialogopen" > 
                <template v-slot:activator="{ on, attrs }">
                  <v-btn fab dark x-small color="red" class="mt-4 text-right" v-bind="attrs" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn>
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
              <v-btn class="mt-2" color="green darken-1" text @click="addToken(schedule.id, 'boolean')"><v-icon dark>mdi-plus-circle-outline</v-icon> Add bool token</v-btn>
              <v-btn class="mt-2" color="green darken-1" text @click="addToken(schedule.id, 'number')"><v-icon dark>mdi-plus-circle-outline</v-icon> Add number token</v-btn>
              <v-btn class="mt-2" color="green darken-1" text @click="addToken(schedule.id, 'string')"><v-icon dark>mdi-plus-circle-outline</v-icon> Add string token</v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Schedule Items</v-expansion-panel-header>
          <v-expansion-panel-content>
            <asv-schedule-item v-for="(si) in schedule.scheduleItems" :key="si.id" :scheduleItem="si" :settings="settings"/>
            <v-btn class="mt-2" color="green darken-1" text @click="addScheduleItem(schedule.id)"><v-icon dark>mdi-plus-circle-outline</v-icon> Add new schedule item</v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import AsvToken from '@/components/Token';
import AsvScheduleItem from '@/components/ScheduleItem';
import { Schedule, ScheduleItem, Token, DaysType, TimeType, TokenItem } from '../WebSettings'

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
      deletedialogopen: false,
      rules: {
        requiredText: [
          value => !!value || 'Required',
        ],
      }
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

                //add all tokens default
                schedule.tokens.forEach(token=>{
                  let ti;
                  if (token.type === 'string') ti = new TokenItem(token,'Not set');
                  else if (token.type === 'number') ti = new TokenItem(token,0);
                  else if (token.type === 'boolean') ti = new TokenItem(token,false);
                  si.tokenitems.push(ti);
                })

                schedule.scheduleitems.push(si)        
            }
        })
        
    },
       
  }

};
</script>
