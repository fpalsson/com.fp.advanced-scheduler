<template>
    <v-row no-gutters>
    <v-container class="pa-0 ma-0">
        <v-sheet elevation="2" class="pa-2">
        <v-row>
            <!--v-col cols="2">
                Day
            </v-col-->
            <v-col cols="10">
                {{ scheduleitem.daysArgShortText }}                                                            
            </v-col>
            <v-col cols="2">
                <!--v-btn fab dark x-small color="green" v-bind="attrs" v-on="on"><v-icon dark>mdi-edit</v-icon></v-btn-->
                <!--v-dialog v-model="'dialogsi' + scheduleitem.id" --> <!-- max-width="290"-->
                <v-dialog v-model="editdialogopen" persistent> <!-- max-width="290"-->
                    <template v-slot:activator="{ on }">
                        <!--v-btn fab dark x-small color="green" v-bind="attrs" v-on="on"><v-icon dark>mdi-pencil</v-icon></v-btn-->
                        <v-btn fab dark x-small color="green" v-on="on"><v-icon dark>mdi-pencil</v-icon></v-btn>
                    </template>
                    <v-form v-model="isEditFormValid">
                        <v-card>
                            <v-card-title>
                                <span class="headline">Edit Scheduleitem</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                            <!--v-select>  v-model="scheduleitem.selectedDays"-->

                                        <v-select
                                            v-model="scheduleitem.selectedDays"
                                            :items="scheduleitem.getAllDays()"
                                            item-value="value"
                                            item-text="day"
                                            return-object
                                            multiple
                                            chips
                                            label="Select"
                                            hint="Select days of week"
                                            persistent-hint
                                        ></v-select>
                                    </v-row>
                                    <v-row>
                                        <v-radio-group
                                            v-model="scheduleitem.timetype"
                                            row
                                            mandatory
                                            >
                                            <v-radio
                                                label="Time"
                                                value="1"
                                                
                                            ></v-radio>
                                            <v-radio
                                                label="Solar"
                                                value="2"
                                            ></v-radio>
                                            </v-radio-group>
                                    </v-row>
                                    <v-row>
                                        <v-select
                                            :disabled="scheduleitem.timetype==1"
                                            v-model="scheduleitem.suneventtype"
                                            :items="getSunEvents()"
                                            item-value="id"
                                            item-text="desc"
                                            label="Sun event"
                                            hint="Choose sun event"
                                            persistent-hint
                                            ></v-select>
                                    </v-row>
                                    <v-row>
                                        <v-text-field v-if="scheduleitem.timetype==1" label="Trigger time" placeholder="Enter a time" v-model="scheduleitem.timearg" :rules="rules.isTime"></v-text-field>
                                        <v-text-field v-if="scheduleitem.timetype==2" label="Offset time" placeholder="Enter an offset" v-model="scheduleitem.timearg" :rules="rules.isOffsetMaxOneDay"></v-text-field>
                                        <!--v-time-picker
                                        format="24hr"
                                        use-seconds
                                        ></v-time-picker-->
                                    </v-row>
                                    <v-row>
                                        <v-btn  color="green darken-1" text @click="editdialogopen=false" :disabled="!isEditFormValid">Close</v-btn>
                                        <!--v-btn color="green darken-1" text @click="'dialogsi' + scheduleitem.id + ' = false'">Close</v-btn-->
                                    </v-row>
                                </v-container>
                            </v-card-text>
                        </v-card>
                    </v-form>>
                </v-dialog>
                

            </v-col>
        </v-row>
        <v-row>
            <v-col cols="10">
                {{ scheduleItemTimeString(scheduleitem.timetype,scheduleitem.suneventtype,scheduleitem.timearg) }}
            </v-col>
            <v-col cols="2">
                <!--v-btn fab dark x-small color="red"><v-icon dark>mdi-delete-circle</v-icon></v-btn-->

                <v-dialog v-model="deletedialogopen" > <!-- max-width="290"-->
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn fab dark x-small color="red" v-bind="attrs" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn>
                    </template>
                    <v-card>
                        <v-card-title class="headline">Delete Scheduleitem?</v-card-title>
                        <v-card-text>Do you want to delete scheduleitem?</v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="green darken-1" text @click="deletedialogopen = false">No</v-btn>
                            <v-btn color="red darken-1" text @click="scheduleItemDeleteAndCloseDialog(scheduleitem.id)">Yes, delete</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
        
        <v-container class="pa-0 ma-0">
            <v-sheet elevation="2" class="pa-2">
                <div>Token Items</div>
                <asv-token-item v-for="(tokenitem) in scheduleitem.tokenitems" :key="tokenitem.token.id" :tokenitem="tokenitem" :settings="settings"/>

                <v-dialog v-model="addTokenItemOpen" > <!-- max-width="290"-->
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn color="green darken-1" :disabled="getNonAddedTokenItems().lenght==0" text v-bind="attrs" v-on="on"><v-icon dark>mdi-plus-circle-outline</v-icon> Add new TokenItem</v-btn>
                    </template>
                    <v-card>
                        <v-card-title class="headline">Add TokenItem</v-card-title>
                        <v-card-text>Select TokenItem to add</v-card-text>

                            <v-select  
                                v-model="tokenItemToAdd"
                                :items="getNonAddedTokenItems()"
                                item-value="id"
                                item-text="name"
                                label="Select"
                                hint="Select token to add"
                                persistent-hint
                            ></v-select>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="red darken-1" text @click="addTokenItemOpen = false">Cancel</v-btn>
                            <v-btn color="green darken-1" :disabled="tokenItemToAdd==-1" text @click="addTokenItemAndCloseDialog(tokenItemToAdd)">Add</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-sheet>
        </v-container>
    </v-sheet>
    </v-container>
  </v-row>

</template>

<script>
import { WebSettings, Schedule, ScheduleItem, TokenItem } from '../websettings';
import AsvTokenItem from '@/components/TokenItem';

export default {
  name: 'AsvScheduleItem',
  components: {
    AsvTokenItem,
  },

  props: {
    scheduleitem: {
      type: ScheduleItem,
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
        editdialogopen: false,
        addTokenItemOpen: false,
        tokenItemToAdd: -1,
        isEditFormValid: false,

        rules: {

            isOffsetMaxOneDay: [
                value => {
                                    
                    const pattern = /^(-?)([01]\d?|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
                    return pattern.test(value) || 'Enter offset in format (-)HH:MM or (-)HH:MM:SS. Negative offset means before event'
                }
            ],
            isTime: [
                value => {
                    const pattern = /^([01]\d?|2[0-3]):[0-5]\d(:[0-5]\d)?$/
                    return pattern.test(value) || 'Enter time in format HH:MM or HH:MM:SS.'
                }
            ]

        },
    };
  },
  methods : {
      scheduleItemDeleteAndCloseDialog : function (scheduleitemid) {
          
          this.settings.schedules.forEach(schedule => {
              schedule.scheduleitems.forEach(si => {
                  if (si.id == scheduleitemid) {
                      var index = schedule.scheduleitems.indexOf(si);
                      if (index !== -1) {
                          schedule.scheduleitems.splice(index, 1);
                          console.log('Deleted schedule item with id: ' +scheduleitemid)
                      }
                      this.deletedialogopen=false;
                  }
              })
          })
      },

      getSunEvents : function (){
          let ws = new WebSettings();
          let suntimes = ws.getSunTimes();
          
          //console.log('suntimes');
          //console.log(suntimes);
          return suntimes;
      },

      scheduleItemTimeString : function (tt,se,ta) {
          //console.log('scheduleItemTimeString')

          if (tt==1) return 'Time: ' + ta;
          if (tt==2) return 'Solar: ' + se + ', offset: ' + ta;
      },

      addTokenItemAndCloseDialog : function (tokenid) {
          let s;
          this.settings.schedules.forEach(schedule=>{
              schedule.scheduleitems.forEach(si=>{
                  if (si.id == this.scheduleitem.id) s=schedule;
              })
          })
          s.tokens.forEach(token=> {
              if (token.id == tokenid){
                  let ti;
                  if (token.type === 'string') ti = new TokenItem(token,'Not set');
                  else if (token.type === 'number') ti = new TokenItem(token,0);
                  else if (token.type === 'boolean') ti = new TokenItem(token,false);
                  this.scheduleitem.tokenitems.push(ti);

              }
              this.addTokenItemOpen=false;
              this.tokenItemToAdd=-1;
          })
          
      },

      getNonAddedTokenItems : function () {
          let sched;
          let res = new Array();
          this.settings.schedules.forEach(schedule=>{
              schedule.scheduleitems.forEach(si=>{
                  if (si.id == this.scheduleitem.id) sched=schedule;
              })
          })
          
          //console.log('Found schedule: ' +sched.name);
          sched.tokens.forEach(token=> {
             //console.log('Checking token: ' +token.name + ' with id: ' + token.id);

              var tifound = false;
              this.scheduleitem.tokenitems.forEach(ti=>{
                    //console.log('Comparing with tokenitem with id : ' + ti.token.id);
                    if (token.id == ti.token.id) {
                        console.log('Same');
                        tifound = true;
                    }
              })

              if (tifound==false){
                    //console.log('pushing token: ' + token.name);
                    res.push(token);
              }
              
          })
          return res;
          
      },

  }

};
</script>

<style scoped>

</style>
