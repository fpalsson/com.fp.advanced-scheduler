<template>
    <v-row no-gutters>
    <v-container class="pa-0 ma-0">
        <v-sheet elevation="2" class="pa-2">
        <v-row>
            <!--v-col cols="2">
                Day
            </v-col-->
            <v-col cols="10">
                {{ daysArgShortText(scheduleItem.daysArg) }}                                                            
            </v-col>
            <v-col cols="2">
                <!--v-btn fab dark x-small color="green" v-bind="attrs" v-on="on"><v-icon dark>mdi-edit</v-icon></v-btn-->
                <!--v-dialog v-model="'dialogsi' + scheduleItem.id" --> <!-- max-width="290"-->
                <v-dialog v-model="editdialogopen" persistent> <!-- max-width="290"-->
                    <template v-slot:activator="{ on }">
                        <!--v-btn fab dark x-small color="green" v-bind="attrs" v-on="on"><v-icon dark>mdi-pencil</v-icon></v-btn-->
                        <v-btn fab dark x-small color="green" v-on="on"><v-icon dark>mdi-pencil</v-icon></v-btn>
                    </template>
                    <v-form v-model="isEditFormValid">
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{$t('Edit_schedule_item')}}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                            <!--v-select>  v-model="scheduleItem.selectedDays"-->

                                        <v-select
                                            v-model="scheduleItem.selectedDays"
                                            :items="translateDays(scheduleItem.getAllDays())"
                                            item-value="value"
                                            item-text="translatedDay"
                                            return-object
                                            multiple
                                            chips
                                            :label="$t('Select')"
                                            :hint="$t('Select_days_of_week')"
                                            persistent-hint
                                        ></v-select>
                                    </v-row>
                                    <v-row>
                                        <v-radio-group
                                            v-model="scheduleItem.timeType"
                                            row
                                            mandatory
                                            >
                                            <v-radio
                                                :label="$t('Time')"
                                                value="1"
                                                
                                            ></v-radio>
                                            <v-radio
                                                :label="$t('Solar')"
                                                value="2"
                                            ></v-radio>
                                            </v-radio-group>
                                    </v-row>
                                    <v-row>
                                        <v-select
                                            :disabled="scheduleItem.timeType==1"
                                            v-model="scheduleItem.sunEventType"
                                            :items="translateSunEvents(getSunEvents())"
                                            item-value="id"
                                            item-text="desc"
                                            :label="$t('Sun_event')"
                                            :hint="$t('Choose_sun_event')"
                                            persistent-hint
                                            ></v-select>
                                    </v-row>
                                    <v-row>
                                        <v-text-field v-if="scheduleItem.timeType==1" :label="$t('Trigger_time')" :placeholder="$t('Enter_a_time')" v-model="scheduleItem.timeArg" :rules="rules.isTime"></v-text-field>
                                        <v-text-field v-if="scheduleItem.timeType==2" :label="$t('Offset_time')" :placeholder="$t('Enter_an_offset')" v-model="scheduleItem.timeArg" :rules="rules.isOffsetMaxOneDay"></v-text-field>
                                        <!--v-time-picker
                                        format="24hr"
                                        use-seconds
                                        ></v-time-picker-->
                                    </v-row>
                                    <v-row>
                                        <v-btn  color="green darken-1" text @click="editdialogopen=false" :disabled="!isEditFormValid">Close</v-btn>
                                        <!--v-btn color="green darken-1" text @click="'dialogsi' + scheduleItem.id + ' = false'">Close</v-btn-->
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
                {{ scheduleItemTimeString(scheduleItem.timeType,scheduleItem.sunEventType,scheduleItem.timeArg) }}
            </v-col>
            <v-col cols="2">
                <!--v-btn fab dark x-small color="red"><v-icon dark>mdi-delete-circle</v-icon></v-btn-->

                <v-dialog v-model="deletedialogopen" > <!-- max-width="290"-->
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn fab dark x-small color="red" v-bind="attrs" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn>
                    </template>
                    <v-card>
                        <v-card-title class="headline">{{ $t('Delete_schedule_item_question') }}</v-card-title>
                        <v-card-text>{{ $t('Do_you_want_to_delete_the_schedule_item_question') }}</v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="green darken-1" text @click="deletedialogopen = false">{{ $t('No') }}</v-btn>
                            <v-btn color="red darken-1" text @click="scheduleItemDeleteAndCloseDialog(scheduleItem.id)">{{ $t('Yes_delete') }}</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
        
        <v-container class="pa-0 ma-0">
            <v-sheet elevation="2" class="pa-2">
                <div>{{ $t('Token_setters') }}</div>
                <asv-token-setter v-for="(tokenSetter) in scheduleItem.tokenSetters" :key="tokenSetter.token.id" :tokenSetter="tokenSetter" :scheduleItem="scheduleItem" :settings="settings"/>

                <v-dialog v-model="addTokenSetterOpen" > <!-- max-width="290"-->
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn color="green darken-1" :disabled="getNonAddedTokenSetters().lenght==0" text v-bind="attrs" v-on="on"><v-icon dark>mdi-plus-circle-outline</v-icon> {{ $t('Add_new_token_setter') }}</v-btn>
                    </template>
                    <v-card>
                        <v-card-title class="headline">{{ $t('Add_token_setter') }}</v-card-title>
                        <v-card-text>{{ $t('Select_token_setter_to_add') }}</v-card-text>

                            <v-select  
                                v-model="tokenSetterToAdd"
                                :items="getNonAddedTokenSetters()"
                                item-value="id"
                                item-text="name"
                                :label="$t('Select')"
                                :hint="$t('Select_token_to_add')"
                                persistent-hint
                            ></v-select>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="red darken-1" text @click="addTokenSetterOpen = false">{{ $t('Cancel') }}</v-btn>
                            <v-btn color="green darken-1" :disabled="tokenSetterToAdd==-1" text @click="addTokenSetterAndCloseDialog(tokenSetterToAdd)">{{ $t('Add') }}</v-btn>
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
import { WebSettings, Schedule, ScheduleItem, TokenSetter } from '@/WebSettings';
import AsvTokenSetter from '@/components/TokenSetter';

export default {
  name: 'AsvScheduleItem',
  components: {
    AsvTokenSetter,
  },

  props: {
    scheduleItem: {
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
        addTokenSetterOpen: false,
        tokenSetterToAdd: -1,
        isEditFormValid: false,

        rules: {

            isOffsetMaxOneDay: [
                value => {
                                    
                    const pattern = /^(-?)([01]\d?|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
                    return pattern.test(value) || this.$t('Enter offset in format')
                }
            ],
            isTime: [
                value => {
                    const pattern = /^([01]\d?|2[0-3]):[0-5]\d(:[0-5]\d)?$/
                    return pattern.test(value) || this.$t('Enter time in format')
                }
            ]

        },
    };
  },
  methods : {
      translateSunEvents: function (sunEvents) {
          sunEvents.forEach(se => {
              se.desc = this.$t(se.id);
          })
          return sunEvents;
      },


      translateDays: function (days) {
          days.forEach(day => {
              day.translatedDay = this.$t(day.day);
          })
          return days;
      },


      daysArgShortText: function (daysArg) {
        let da = daysArg;
        console.log('daysArgShortText daysarg: ' + da)
        if (da == 0) return this.$t('Nothing');
        else if (da == 1+2+4+8+16) return this.$t('Weekdays');
        else if (da == 32+64) return this.$t('Weekends');
        else if (da == 1+2+4+8+16+32+64) return this.$t('All_week');
        else{
            //console.log('daysArgShortText daysarg2: ' + da)
            var s = '';
            if ((da & 1) > 0) s+=this.$t('Monday_short')+',';
            if ((da & 2) > 0) s+=this.$t('Tuesday_short')+',';
            if ((da & 4) > 0) s+=this.$t('Wednesday_short')+',';
            if ((da & 8) > 0) s+=this.$t('Thursday_short')+',';
            if ((da & 16) > 0) s+=this.$t('Friday_short')+',';
            if ((da & 32) > 0) s+=this.$t('saturday_short')+',';
            if ((da & 64) > 0) s+=this.$t('Sunday_short')+',';
            //console.log('daysArgShortText daysarg3: ' + s)
            s = s.substring(0, s.length-1);
            return s;
        }
      },


      scheduleItemDeleteAndCloseDialog : function (scheduleItemid) {
          
          this.settings.schedules.forEach(schedule => {
              schedule.scheduleItems.forEach(si => {
                  if (si.id == scheduleItemid) {
                      var index = schedule.scheduleItems.indexOf(si);
                      if (index !== -1) {
                          schedule.scheduleItems.splice(index, 1);
                          console.log('Deleted schedule item with id: ' +scheduleItemid)
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

          if (tt==1) return this.$t('Time') +': ' + ta;
          if (tt==2) return this.$t('Solar') + ': ' + this.$t(se) + ', ' + this.$t('offset') + ': ' + ta;
      },

      addTokenSetterAndCloseDialog : function (tokenid) {
          let s;
          this.settings.schedules.forEach(schedule=>{
              schedule.scheduleItems.forEach(si=>{
                  if (si.id == this.scheduleItem.id) s=schedule;
              })
          })
          s.tokens.forEach(token=> {
              if (token.id == tokenid){
                  let ti;
                  if (token.type === 'string') ti = new TokenSetter(token,this.$t('Not set'));
                  else if (token.type === 'number') ti = new TokenSetter(token,0);
                  else if (token.type === 'boolean') ti = new TokenSetter(token,false);
                  this.scheduleItem.tokenSetters.push(ti);

              }
              this.addTokenSetterOpen=false;
              this.tokenSetterToAdd=-1;
          })
          
      },

      getNonAddedTokenSetters : function () {
          let sched;
          let res = new Array();
          this.settings.schedules.forEach(schedule=>{
              schedule.scheduleItems.forEach(si=>{
                  if (si.id == this.scheduleItem.id) sched=schedule;
              })
          })
          
          //console.log('Found schedule: ' +sched.name);
          sched.tokens.forEach(token=> {
             //console.log('Checking token: ' +token.name + ' with id: ' + token.id);

              var tifound = false;
              this.scheduleItem.tokenSetters.forEach(ti=>{
                    //console.log('Comparing with tokenSetter with id : ' + ti.token.id);
                    if (token.id == ti.token.id) {
                        //console.log('Same');
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
