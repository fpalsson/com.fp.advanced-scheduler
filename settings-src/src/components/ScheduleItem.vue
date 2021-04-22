<template>
    <v-row no-gutters>
    <v-container class="pa-0 ma-0">
        <v-sheet elevation="2" class="pa-2">
        <v-row>
            <v-col cols="10">
                {{ daysArgShortText(scheduleItem.daysArg) }}                                                            
            </v-col>
            <v-col cols="2">
                <v-dialog v-model="editdialogopen" persistent> <!-- max-width="290"-->
                    <template v-slot:activator="{ on }">
                        <v-btn fab dark x-small color="green" v-on="on"><v-icon dark>mdi-pencil</v-icon></v-btn>
                    </template>
                    <v-form> <!--v-model="isEditFormValid"-->
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{$t('Edit_schedule_item')}}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-row>
                                      <v-chip-group
                                            multiple
                                            column
                                            active-class="primary--text"
                                            v-model="scheduleItem.selectedDays"
                                            >
                                            <v-chip :value="1">{{ $t('Monday_short') }}</v-chip>
                                            <v-chip :value="2">{{ $t('Tuesday_short') }}</v-chip>
                                            <v-chip :value="3">{{ $t('Wednesday_short') }}</v-chip>
                                            <v-chip :value="4">{{ $t('Thursday_short') }}</v-chip>
                                            <v-chip :value="5">{{ $t('Friday_short') }}</v-chip>
                                            <v-chip :value="6">{{ $t('Saturday_short') }}</v-chip>
                                            <v-chip :value="7">{{ $t('Sunday_short') }}</v-chip>
                                        </v-chip-group>

                                        <!--v-select
                                            v-model="scheduleItem.selectedDays"
                                            :items="translateDays(scheduleItem.getAllDays())"
                                            item-value="value"
                                            item-text="translatedShortDay"
                                            return-object
                                            multiple
                                            :label="$t('Select')"
                                            :hint="$t('Select_days_of_week')"
                                            persistent-hint
                                        ></v-select-->
                                    </v-row>
                                    <asv-time-sun-event v-model="scheduleItem.mainTrigger"
                                                    :validInput.sync="mainTriggerValid"
                                                    >
                                    </asv-time-sun-event>
                                    
                                    <v-checkbox class="mb-2" v-model="showAdvancedSettings" :label="$t('Show_advanced_settings')" hide-details="true" dense></v-checkbox>
                                    <v-container v-if="showAdvancedSettings">

                                        <v-row>
                                            <v-checkbox class="mb-2" v-model="scheduleItem.randomTrigger.used" :label="$t('Use_random_settings')" hide-details="true" dense></v-checkbox>
                                        </v-row>
                                        <v-container v-if="scheduleItem.randomTrigger.used" >
                                            <v-row class="pl-5">
                                                <label>{{ $t('Random_time_before_or_after_trigger') }}</label>
                                            </v-row>
                                            <v-row>
                                                <asv-time-sun-event v-model="scheduleItem.randomTrigger"
                                                                :validInput.sync="randomTriggerValid"
                                                                >
                                                </asv-time-sun-event>
                                            </v-row>
                                        </v-container>
                                        
                                        <v-row>
                                            <v-checkbox class="mb-2" v-model="triggerFirstLastUsed" :label="$t('Use_first_or_last_of')" hide-details="true" dense></v-checkbox>
                                        </v-row>
                                        
                                        <v-row>     
                                            <v-container v-if="triggerFirstLastUsed">
                                                <v-row>
                                                    <v-radio-group v-model="triggerFirstLastVariant" row mandatory hide-details="true"
                                                        >
                                                        <v-radio
                                                            :label="$t('First_of')"
                                                            :value="1"
                                                        ></v-radio>
                                                        <v-radio
                                                            :label="$t('Last_of')"
                                                            :value="2"
                                                        ></v-radio>
                                                    </v-radio-group>
                                                </v-row>
                                                <v-row v-if="scheduleItem.triggerFirstOf.used"> 
                                                    <label>{{ $t('Trigger_first_of_this_and_main') }}</label>
                                                </v-row>
                                                <v-row v-if="scheduleItem.triggerFirstOf.used" class="pl-3">
                                                    <asv-time-sun-event v-model="scheduleItem.triggerFirstOf"
                                                                    :validInput.sync="triggerFirstOfValid"
                                                                    >
                                                    </asv-time-sun-event>
                                                </v-row>

                                                <v-row v-if="scheduleItem.triggerLastOf.used">
                                                    <label>{{ $t('Trigger_last_of_this_and_main') }}</label>
                                                </v-row>
                                                <v-row v-if="scheduleItem.triggerLastOf.used" class="pl-3"> 
                                                    <asv-time-sun-event v-model="scheduleItem.triggerLastOf"
                                                                    :validInput.sync="triggerLastOfValid"
                                                                    >
                                                    </asv-time-sun-event>
                                                </v-row>
                                            </v-container>
                                        </v-row>
                                        <v-row>
                                            <v-checkbox class="mb-2" v-model="scheduleItem.onlyTriggerIfBefore.used" :label="$t('Use_conditional_before')" hide-details="true" dense></v-checkbox>
                                        </v-row>
                                        <v-container v-if="scheduleItem.onlyTriggerIfBefore.used" >
                                            <v-row class="pl-5">
                                                <label>{{ $t('Only_trigger_if_before') }}</label>
                                            </v-row>
                                            <v-row>
                                                <asv-time-sun-event v-model="scheduleItem.onlyTriggerIfBefore"
                                                                        :validInput.sync="onlyTriggerIfBeforeTriggerValid"
                                                                >
                                                </asv-time-sun-event>
                                            </v-row>
                                        </v-container>
                                        
                                        <v-row>
                                            <v-checkbox class="mb-2" v-model="scheduleItem.onlyTriggerIfAfter.used" :label="$t('Use_conditional_after')" hide-details="true" dense></v-checkbox>
                                        </v-row>
                                        <v-container v-if="scheduleItem.onlyTriggerIfAfter.used" >
                                            <v-row class="pl-5">
                                                <label>{{ $t('Only_trigger_if_after') }}</label>
                                            </v-row>
                                            <v-row>
                                                <asv-time-sun-event v-model="scheduleItem.onlyTriggerIfAfter"
                                                                :validInput.sync="onlyTriggerIfAfterTriggerValid"
                                                                >
                                                </asv-time-sun-event>
                                            </v-row>
                                        </v-container>


                                    </v-container>
                                    <v-row>
                                        <v-btn  color="green darken-1" text @click="editdialogopen=false" :disabled="!allInputValid">{{ $t('Close') }}</v-btn>
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
                {{ scheduleItemTimeString() }} 
            </v-col>
            <v-col cols="2">
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
                            <v-btn color="red darken-1" text @click="scheduleItemDeleteAndCloseDialog()">{{ $t('Yes_delete') }}</v-btn>
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
import { ScheduleItem } from '@/CommonContainerClasses';
import AsvTokenSetter from '@/components/TokenSetter';
import AsvTimeSunEvent from '@/components/TimeSunEvent';


export default {
  name: 'AsvScheduleItem',
  components: {
    AsvTokenSetter,
    AsvTimeSunEvent,
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
        mainTriggerValid: false,
        randomTriggerValid: false,
        
        triggerFirstOfValid: false,
        triggerLastOfValid: false,

        onlyTriggerIfBeforeTriggerValid: false,
        onlyTriggerIfAfterTriggerValid: false,

        showAdvancedSettings: this.scheduleItem.randomTrigger.used || this.scheduleItem.triggerFirstOf.used || this.scheduleItem.triggerLastOf.used ||
                               this.scheduleItem.onlyTriggerIfBefore.used || this.scheduleItem.onlyTriggerIfAfter.used,
        triggerFirstLastUsed: this.scheduleItem.triggerFirstOf.used || this.scheduleItem.triggerLastOf.used,
        triggerFirstLastVariant: (this.scheduleItem.triggerLastOf.used?2:1),

        rules: {

            isOffsetMaxOneDay: [
                value => {
                                    
                    const pattern = /^(-?)([01]\d?|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
                    return pattern.test(value) || this.$t('Enter_offset_in_format')
                }
            ],
            isTime: [
                value => {
                    const pattern = /^([01]\d?|2[0-3]):[0-5]\d(:[0-5]\d)?$/
                    return pattern.test(value) || this.$t('Enter_time_in_format')
                }
            ],
            suneventvalid: [
                value => {
                    return (value.length>0 || this.scheduleItem.timeType==1) || this.$t('Select_event');
                }
            ],

        },
    };
  },
  methods : {
  /*  translateDays: function (days) {
        days.forEach(day => {
            day.translatedDay = this.$t(day.day);
            day.translatedShortDay= this.$t(day.shortDay);
        })
        return days;
    },
*/
    daysArgShortText: function (daysArg) {
        let da = daysArg;
        //console.log('daysArgShortText daysarg: ' + da)
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
            if ((da & 32) > 0) s+=this.$t('Saturday_short')+',';
            if ((da & 64) > 0) s+=this.$t('Sunday_short')+',';
            //console.log('daysArgShortText daysarg3: ' + s)
            s = s.substring(0, s.length-1);
            return s;
        }
    },


    scheduleItemDeleteAndCloseDialog : function () {
        this.scheduleItem.delete();  
        this.deletedialogopen=false;
    },

    scheduleItemTimeString : function () {
        let mt = this.scheduleItem.mainTrigger;
        let rt = this.scheduleItem.randomTrigger;
        let fo = this.scheduleItem.triggerFirstOf;
        let lo = this.scheduleItem.triggerLastOf;
        let ob = this.scheduleItem.onlyTriggerIfBefore;
        let oa = this.scheduleItem.onlyTriggerIfAfter;

        let mtString = this.timeInfoTimeString(mt);
        let rtString = this.timeInfoTimeString(rt);
        let foString = this.timeInfoTimeString(fo);
        let loString = this.timeInfoTimeString(lo);
        let obString = this.timeInfoTimeString(ob);
        let oaString = this.timeInfoTimeString(oa);

        let res = '';
        if (fo.used) res += this.$t('First_of') + ' ' + foString + ' ' + this.$t('and') + ' ';
        if (lo.used) res += this.$t('Last_of') + ' ' + loString + ' ' + this.$t('and') + ' ';
        if (!rt.used) res += mtString;
        else res += this.$t('Random_time_between') + ' ' + mtString + ' ' + this.$t('and') + ' ' + rtString;

        if (ob.used && !oa.used) res += ' ' + this.$t('but_only_if_before') + ' (' + obString + ')';
        else if (oa.used && !ob.used) res += ' ' + this.$t('but_only_if_after') + ' (' + oaString + ')';
        else if (ob.used && oa.used) res += ' ' + this.$t('but_only_if_before') + ' (' + obString + ') ' + this.$t('and_after') + ' (' + oaString + ')';

        return res;
    },

    timeInfoTimeString(ti) {
        if (ti.timeType==1) return ti.time;

        if (ti.timeType==2) {
            let res = this.$t(ti.sunEvent);
            if (ti.solarOffset=='00:00' || ti.solarOffset =='00:00:00') return res;
            if (ti.solarOffset.includes('-')) return ti.solarOffset.replace('-','') + ' ' + this.$t('before') + ' ' + res;
            else return ti.solarOffset + ' ' + this.$t('after') + ' ' + res;
        }
    },


    addTokenSetterAndCloseDialog : function (tokenid) {
        this.scheduleItem.addNewTokenSetterByIdNoVal(tokenid)
          
        this.addTokenSetterOpen=false;
        this.tokenSetterToAdd=-1;
      },

      getNonAddedTokenSetters : function () {
          let sched;
          let res = new Array();
          this.scheduleItem.schedule.tokens.forEach(token=> {
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

        handleFirstLast : function () {
            if (this.triggerFirstLastUsed) {
                this.scheduleItem.triggerFirstOf.used = this.triggerFirstLastVariant==1;
                this.scheduleItem.triggerLastOf.used = this.triggerFirstLastVariant==2;
            }
            else {
                this.scheduleItem.triggerFirstOf.used = false;
                this.scheduleItem.triggerLastOf.used = false;
            }
        },      

    },
    computed:{
        allInputValid : function () {
            return this.mainTriggerValid &&
            (!this.scheduleItem.randomTrigger.used || (this.scheduleItem.randomTrigger.used && this.randomTriggerValid)) && 
            (!this.scheduleItem.triggerFirstOf.used || (this.scheduleItem.triggerFirstOf.used && this.triggerFirstOfValid)) &&
            (!this.scheduleItem.triggerLastOf.used || (this.scheduleItem.triggerLastOf.used && this.triggerLastOfValid)) &&
            (!this.scheduleItem.onlyTriggerIfBefore.used || (this.scheduleItem.onlyTriggerIfBefore.used && this.onlyTriggerIfBeforeTriggerValid)) &&
            (!this.scheduleItem.onlyTriggerIfAfter.used || (this.scheduleItem.onlyTriggerIfAfter.used && this.onlyTriggerIfAfterTriggerValid)) 
        
        },
        
    },
    watch: {
            triggerFirstLastVariant: function (val) {
                //console.log('watch var' + val);
                this.handleFirstLast();
            },

            triggerFirstLastUsed : function (val) {
                //console.log('watch used' + val);
                this.handleFirstLast();
            },
      
        }
};
</script>

<style scoped>

</style>
