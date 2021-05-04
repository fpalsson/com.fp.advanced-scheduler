<template>
  <v-expansion-panel>
    <v-expansion-panel-header v-if="schedule.active"><b>{{ schedule.name }}, {{ $t('Active') }}</b></v-expansion-panel-header>
    <v-expansion-panel-header v-else                >{{ schedule.name }}, {{ $t('Inactive') }}</v-expansion-panel-header>
    <v-expansion-panel-content>
      <!--v-switch v-model="switch1" :label="`Switch 1: ${switch1.toString()}`" ></v-switch-->
       <v-container class="px-0">
          <v-row no-gutters>
            <v-col cols="6">
              <v-text-field :label="$t('Schedule_name')" :placeholder="$t('Enter_a_schedule_name')" hide-details="auto" v-model="schedule.name" :rules="rules.requiredText"></v-text-field>
          </v-col>
            <v-col cols="4">
              <v-switch :label="$t('Active')" v-model="schedule.active"></v-switch>
            </v-col>
            <v-col cols="2">
              <v-dialog v-model="deletedialogopen" > 
                <template v-slot:activator="{ on, attrs }">
                  <v-btn fab dark x-small color="red" class="mt-4 text-right" v-bind="attrs" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn>
                </template>
                <v-card>
                  <v-card-title class="headline">{{ $t('Delete_schedule_question') }}</v-card-title>
                  <v-card-text>{{ $t('Do_you_want_to_delete_schedule_question') }}</v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="deletedialogopen = false">{{ $t('No') }}</v-btn>
                    <v-btn color="red darken-1" text @click="scheduleDeleteAndCloseDialog(schedule.id)">{{ $t('Yes_delete') }}</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-container>


      <v-expansion-panels>
        <v-expansion-panel>

          <v-expansion-panel-header>{{ $t('Tokens') }}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <asv-token v-for="(token) in schedule.tokens" :key="token.id" :token="token" :settings="settings"/>
            <v-btn class="mt-2" color="green darken-1" text @click="addToken(schedule.id, 'boolean')"><v-icon dark>mdi-plus-circle-outline</v-icon>{{ $t('Add_bool_token') }}</v-btn>
            <v-btn class="mt-2" color="green darken-1" text @click="addToken(schedule.id, 'number')"><v-icon dark>mdi-plus-circle-outline</v-icon>{{ $t('Add_number_token') }}</v-btn>
            <v-btn class="mt-2" color="green darken-1" text @click="addToken(schedule.id, 'string')"><v-icon dark>mdi-plus-circle-outline</v-icon>{{ $t('Add_string_token') }}</v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>{{ $t('Schedule_items') }}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <asv-schedule-item v-for="(si) in schedule.scheduleItems" :key="si.id" :scheduleItem="si" :settings="settings"/>
            <v-btn class="mt-2" color="green darken-1" text @click="addScheduleItem(schedule.id)"><v-icon dark>mdi-plus-circle-outline</v-icon> {{ $t('Add_new_schedule_item') }}</v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import AsvToken from '@/components/Token';
import AsvScheduleItem from '@/components/ScheduleItem';
import { Schedule, DaysType, TimeType } from '../../../src/CommonContainerClasses'

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
          value => !!value || this.$t('Required'),
        ],
      }
    };
  },
  methods: {

    scheduleDeleteAndCloseDialog : function (scheduleid) {
      this.schedule.delete(scheduleid);
      this.deletedialogopen=false;
    },

    addToken : function (scheduleid, type) {
      this.schedule.addNewToken(this.$t('New_token'),type);
    },
    
    addScheduleItem : function (scheduleid) {
      this.schedule.addNewScheduleItem(DaysType.DaysOfWeek, 1+2+4+8+16+32+64, TimeType.TimeOfDay, '', '00:00')

      
    },
  }
};
</script>
