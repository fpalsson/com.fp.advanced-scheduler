<template>
    <v-container>
        <div>
            {{ longStringWithDate }}
        </div>
        <v-slider
            class="mb-6"
            v-model="slider"
            max="365"
            min="0"
            :hint="$t('Slide_to_select_a_date')"
            persistent-hint
            >
        </v-slider>
        <v-simple-table>
            <thead>
                
                <tr>
                    <th> <b><p style="font-size:16px"> {{ $t('Event') }} </p> </b></th>
                    <th> <b><p style="font-size:16px"> {{ $t('Time') }} </p> </b></th>
               </tr>
            </thead>
            <tbody>
                <tr v-for="se in sunEvents" :key="se.id">
                    <td>
                         {{ $t(se.id) }}
                    </td>
                    <td v-if="isValidDate(se.time)">
                        {{ se.time.toTimeString().substring(0,8) }}
                    </td>
                    <td v-if="!isValidDate(se.time)">
                        {{ $t('Will_not_occur') }}
                    </td>
                </tr>
            </tbody>

        </v-simple-table>


    </v-container>

</template>

<script>

import { TimeInfo } from '../../../src/CommonContainerClasses';
import { SunWrapper } from '../../../src/SunWrapper';
 

export default {
  name: 'AsvSunEventTimes',
  components: {
  },

  props: {

  },
  data() {
    return {
        slider : 0,
        };
    },
    methods : {
        getSunEvents() {
            let sw = this.$root.$children[0].sunWrapper;
            let d = this.sliderDate;
            let suntimes = sw.getTimes(d);
            return suntimes;
        },
        isValidDate(d) {
            return d instanceof Date && !isNaN(d.getTime());
        },
        

    },
    computed: {
        longStringWithDate : function () {
            let res = this.$t('List_of_solar_events_long');
            let d = this.sliderDate;
            return res.replace('%date%', this.sliderDateText);
        },
        sliderDate : function() {
            let d = new Date();
            d.setTime(d.getTime()+this.slider*1000*3600*24);
            return d;
        },
        sliderDateText : function() {
            return this.sliderDate.toLocaleDateString(this.$t('extended-locale'));
        },
        
        sunEvents : function() {
            let sw = this.$root.$children[0].sunWrapper;
            let d = this.sliderDate;
            let suntimes = sw.getTimes(d);
            return suntimes;
        } 
    },
    
  

};
</script>

<style scoped>

</style>
