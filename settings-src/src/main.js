import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
//import VueNumericInput from 'vue-numeric-input';
//import { onlyFloat } from 'vue-input-only-number';
//import VNumeric from 'vuetify-numeric/vuetify-numeric.umd'
import VCurrencyField from 'v-currency-field'
import { VTextField } from 'vuetify/lib'  //Globally import VTextField for Treeshaking to work



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
//    components: {
//      onlyFloat,
//    },
    mounted() {
      this.Homey.ready();
    }
  }).$mount('#app');
  //Vue.use(VNumeric)
  Vue.component('v-text-field', VTextField); //Needed for treeshaking to work with VCurrencyField
  Vue.use(VCurrencyField, { 
    locale: 'en-GB',
    decimalLength: {min:0, max:4},
    autoDecimalMode: false,
    min: null,
    max: null,
    defaultValue: 0,
      valueAsInteger: false,
      allowNegative: true
  })
  
}, false);
