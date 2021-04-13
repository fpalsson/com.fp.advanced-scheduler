<template>
    <!-- The whole component expects a TimeInfo object in the v-model-->
    <v-form v-model="validInput" @input="$emit('update:validInput', validInput);">
        <v-row>
            <v-radio-group
                v-model="value.timeType"
                @change="handleInput()"
                row
                mandatory
                hide-details="true"
                >
                <v-radio
                    :label="$t('Time')"
                    :value="1"
                ></v-radio>
                <v-radio
                    :label="$t('Solar')"
                    :value="2"
                ></v-radio>
                </v-radio-group>
        </v-row>
        
        <v-row>
            <v-select v-if="value.timeType==2"
                v-model="value.sunEvent"
                @input="handleInput()"
                :items="translateSunEvents(getSunEvents())"
                item-value="id"
                item-text="desc"
                :label="$t('Sun_event')"
                :hint="$t('Choose_sun_event')"
                persistent-hint
                :rules="rules.suneventvalid"
                ></v-select>
                <!-- :rules="rules.suneventvalid"-->
        </v-row>
        <v-row>
            <v-text-field v-if="value.timeType==1" :label="$t('Trigger_time')" :placeholder="$t('Enter_a_time')" :rules="rules.isTime"
                          v-model="value.time"
                          @input="handleInput()"
                          ></v-text-field>

            <v-text-field v-if="value.timeType==2" :label="$t('Offset_time')" :placeholder="$t('Enter_an_offset')" :rules="rules.isOffsetMaxOneDay"
                        v-model="value.solarOffset" 
                        @input="handleInput()"                         
                        ></v-text-field>
        </v-row>
    </v-form>

</template>

<script>

//The whole component expects a TimeInfo object in the v-model

import { SunWrapper, TimeInfo } from '@/CommonContainerClasses';
import { TimeType } from '../CommonContainerClasses';

export default {
  name: 'AsvTimeSunEvent',
  components: {
  },

  props: {
    value: {
      type: TimeInfo,
      required: true
    },
    validInput: {
      type: Boolean,
      required:false
    }

  },
  data() {
    return {
        timeValid: true,
        sunEventTypeValid: true,
        solarOffsetValid: true,
        rules: {

            isOffsetMaxOneDay: [
                value => {
                                    
                    const pattern = /^(-?)([01]\d?|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
                    this.solarOffsetValid = pattern.test(value) 
                    this.updateValid();
                    return this.solarOffsetValid || this.$t('Enter_offset_in_format')
                }
            ],
            isTime: [
                value => {
                    const pattern = /^([01]\d?|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
                    this.timeValid = pattern.test(value); 
                    this.updateValid();
                    return this.timeValid || this.$t('Enter_time_in_format');
                }
            ],
            suneventvalid: [
                value => {
                    //console.log('suneventisvalid value: ' + value + '   (!(value!="") ' + !(value!=""));
                    this.sunEventTypeValid = !(value=='' || value === undefined);
                    this.updateValid();
                    return this.sunEventTypeValid || this.$t('Select_event');
                }
            ],

            },
        };
    },
    methods : {

        handleInput : function () {
            this.$emit('input', this.value)
        },

        updateValid : function (){
            if (this.value.timeType==1) {
                this.validInput = this.timeValid;
            }
            else if (this.value.timeType==2) {
                this.validInput = this.sunEventTypeValid && this.solarOffsetValid;
            }

        },

        translateSunEvents: function (sunEvents) {
            sunEvents.forEach(se => {
              se.desc = this.$t(se.id);
            })
            return sunEvents;
        },

        getSunEvents : function (){
            let sw = new SunWrapper();
            let suntimes = sw.getSunTimes();
            
            //console.log('suntimes');
            //console.log(suntimes);
            return suntimes;
        },
    },
  

};
</script>

<style scoped>

</style>
