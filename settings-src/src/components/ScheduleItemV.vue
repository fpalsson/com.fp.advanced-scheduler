<template>
    <v-row no-gutters>
        <v-container>
            <v-sheet>
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
                    <v-dialog v-model="scheduleitem.editdialogopen"> <!-- max-width="290"-->
                        <template v-slot:activator="{ on }">
                            <!--v-btn fab dark x-small color="green" v-bind="attrs" v-on="on"><v-icon dark>mdi-pencil</v-icon></v-btn-->
                            <v-btn fab dark x-small color="green" v-on="on"><v-icon dark>mdi-pencil</v-icon></v-btn>
                        </template>
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
                                        <v-text-field label="Trigger/offset time" placeholder="Enter a time" v-model="scheduleitem.timearg"></v-text-field>
                                        <!--v-time-picker
                                        format="24hr"
                                        use-seconds
                                        ></v-time-picker-->
                                    </v-row>
                                    <v-row>
                                        <v-btn  color="green darken-1" text @click="scheduleitem.editdialogopen=false">Close</v-btn>
                                        <!--v-btn color="green darken-1" text @click="'dialogsi' + scheduleitem.id + ' = false'">Close</v-btn-->
                                    </v-row>
                                </v-container>
                            </v-card-text>
                        </v-card>
                    </v-dialog>


                </v-col>
            </v-row>
            <v-row>
                <v-col cols="10">
                    {{ scheduleItemTimeString(scheduleitem.timetype,scheduleitem.suneventtype,scheduleitem.timearg) }}
                </v-col>
                <v-col cols="2">
                    <!--v-btn fab dark x-small color="red"><v-icon dark>mdi-delete-circle</v-icon></v-btn-->

                    <v-dialog v-model="scheduleitem.deletedialogopen" > <!-- max-width="290"-->
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn fab dark x-small color="red" v-bind="attrs" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn>
                        </template>
                        <v-card>
                            <v-card-title class="headline">Delete Scheduleitem?</v-card-title>
                            <v-card-text>Do you want to delete scheduleitem?</v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="green darken-1" text @click="scheduleitem.deletedialogopen = false">No</v-btn>
                                <v-btn color="red darken-1" text @click="scheduleItemDeleteAndCloseDialog(scheduleitem.id)">Yes, delete</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-col>
            </v-row>
        </v-sheet>
        </v-container>
    </v-row>
</template>

<script>
import { ScheduleItem } from '../websettings';
export default {
  name: 'ScheduleItemV',
  props: {
    scheduleitem: {
      type: ScheduleItem,
      required: true
    }
  },
  data() {
    return {
      deletedialogopen: false,
      editdialogopen: false,
      //days: 'Mo',
      //time: null
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
                        si.deletedialogopen=false;
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

  }
};
</script>

<style scoped>

</style>
