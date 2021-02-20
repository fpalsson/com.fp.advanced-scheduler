<template>
  <v-expansion-panel>
    <v-expansion-panel-header>{{ schedule.name }}, Active:{{ schedule.active }}</v-expansion-panel-header>
    <v-expansion-panel-content>
      <!--v-switch v-model="switch1" :label="`Switch 1: ${switch1.toString()}`" ></v-switch-->
      <v-container>
        <v-row no-gutters>
          <v-col cols="8">
            <v-text-field label="Schedule name" placeholder="Enter a schedule name"
                          v-model="schedule.name"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-switch label="Active" v-model="schedule.active"></v-switch>
          </v-col>
        </v-row>
      </v-container>


      <v-expansion-panels>
        <v-expansion-panel>

          <v-expansion-panel-header>Tokens</v-expansion-panel-header>
          <v-expansion-panel-content>
            <schedule-token v-for="(token, i) in schedule.tokens" :key="i" :token="token" />
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-header>Schedule Items</v-expansion-panel-header>
          <v-expansion-panel-content>
            <schedule-item v-for="(item, i) in schedule.scheduleitems" :key="i" :item="item" />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import ScheduleToken from '@/components/ScheduleToken';
import ScheduleItem from '@/components/ScheduleItem';

export default {
  name: 'Schedule',
  components: {
    ScheduleToken,
    ScheduleItem
  },
  props: {
    schedule: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialog: false
    };
  }
};
</script>
