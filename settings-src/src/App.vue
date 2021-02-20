<template>
  <v-app>
    <v-main>
      <v-expansion-panels>
        <schedule v-for="(schedule, i) in settings.schedules" :key="i" :schedule="schedule" />
      </v-expansion-panels>
    </v-main>
  </v-app>
</template>

<script>

import Schedule from '@/components/Schedule';
export default {
  name: 'App',
  components: {
    Schedule

  },
  data() {
    return {
      settings: {}
    };
  },
  mounted() {
    this.Homey.get('settings', (err, settings) => {
      if (err) return this.Homey.alert(err);
      this.settings = JSON.parse(settings).settings;
    });
  }
};
</script>
