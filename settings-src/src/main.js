import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

//Listen for the event when Homey is ready
window.addEventListener('onHomeyReady', function (event) {
  const Homey = event.detail;

  Vue.mixin({
    data() {
      return {
        get Homey() {
          return Homey;
        }
      };
    }
  });

  new Vue({
    render: h => h(App),
    vuetify,
    mounted() {
      this.Homey.ready();
    }
  }).$mount('#app');
}, false);
