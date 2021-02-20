<template>
  <v-row no-gutters>
    <v-container>
      <v-sheet>
        <v-row>
          <!--v-col cols="2">
              Day
          </v-col-->
          <v-col cols="10">
            Days: {{ item.daysArgText }}
          </v-col>
          <v-col cols="2">
            <!--v-btn fab dark x-small color="green" v-bind="attrs" v-on="on"><v-icon dark>mdi-edit</v-icon></v-btn-->
            <!--v-dialog v-model="'dialogsi' + item.id" --> <!-- max-width="290"-->
            <v-dialog v-model="editDialog"> <!-- max-width="290"-->
              <template v-slot:activator="{ on }">
                <!--v-btn fab dark x-small color="green" v-bind="attrs" v-on="on"><v-icon dark>mdi-pencil</v-icon></v-btn-->
                <v-btn fab dark x-small color="green" v-on="on">
                  <v-icon dark>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">Edit Scheduleitem</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-select
                          v-model="days"
                          :items="['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']"
                          label="Select"
                          multiple
                          chips
                          hint="Select days of week"
                          persistent-hint
                      ></v-select>
                    </v-row>
                    <v-row>
                      <v-radio-group
                          v-model="time"
                          row
                          mandatory
                      >
                        <v-radio
                            label="Time"
                            value="radio-time"

                        ></v-radio>
                        <v-radio
                            label="Solar"
                            value="radio-solar"
                        ></v-radio>
                      </v-radio-group>
                    </v-row>
                    <v-row>
                      <v-text-field label="Trigger time" placeholder="Enter a time"
                                    v-model="item.timearg"></v-text-field>
                      <!--v-time-picker
                      format="24hr"
                      use-seconds
                      ></v-time-picker-->
                    </v-row>
                    <v-row>
                      <v-btn color="green darken-1" text @click="editDialog=false">Close 1</v-btn>
                      <v-btn color="green darken-1" text @click="editDialog=false">Close 2</v-btn>
                      <!--v-btn color="green darken-1" text @click="'dialogsi' + item.id + ' = false'">Close</v-btn-->
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-dialog>


          </v-col>
        </v-row>
        <v-row>
          <v-col cols="8">
            {{ item.timetype }}
          </v-col>
          <v-col cols="2">
            {{ item.timearg }}
          </v-col>
          <v-col cols="2">
            <!--v-btn fab dark x-small color="red"><v-icon dark>mdi-delete-circle</v-icon></v-btn-->

            <v-dialog v-model="dialog"> <!-- max-width="290"-->
              <template v-slot:activator="{ on, attrs }">
                <v-btn fab dark x-small color="red" v-bind="attrs" v-on="on">
                  <v-icon dark>mdi-delete-circle</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="headline">Delete Scheduleitem?</v-card-title>
                <v-card-text>Do you want to delete scheduleitem?</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="green darken-1" text @click="dialog = false">No</v-btn>
                  <v-btn color="red darken-1" text @click="dialog = false">Yes, delete</v-btn>
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
export default {
  name: 'ScheduleItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialog: false,
      editDialog: false,
      days: 'Mo',
      time: null
    };
  }
};
</script>

<style scoped>

</style>
