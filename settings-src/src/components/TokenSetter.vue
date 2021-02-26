<template>
    <v-row no-gutters>
        <v-col cols="5" class="mt-4">
            {{ tokenSetter.token.name }}
        </v-col>
        <v-col cols="5">
            <v-text-field v-if="tokenSetter.token.type==='string'" label="Token Setter value" placeholder="Enter a string value" v-model="tokenSetter.value"></v-text-field>
            <v-currency-field v-if="tokenSetter.token.type==='number'" label="Token Setter value" placeholder="Enter a numeric value" v-model="tokenSetter.value"></v-currency-field>
            <v-switch v-if="tokenSetter.token.type==='boolean'" label="Value" v-model="tokenSetter.value"></v-switch>
            
        </v-col>
        <v-col cols="2">
            <v-dialog v-model="deletedialogopen"> 
                <template v-slot:activator="{ on }">
                    <v-btn class="mt-4 text-right" fab dark x-small color="red" v-on="on"><v-icon dark>mdi-minus-circle-outline</v-icon></v-btn>
                </template>
                <v-card>
                    <v-card-title class="headline">Delete Token item?</v-card-title>
                    <v-card-text>Do you want to delete token item?</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="green darken-1" text @click="deletedialogopen=false">No</v-btn>
                        <v-btn color="red darken-1" text @click="tokenSetterDeleteAndCloseDialog(token.id)">Yes, delete</v-btn>
                    </v-card-actions>  
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>
</template>

<script>
import { TokenSetter } from '../WebSettings'

export default {
  name: 'AsvTokenSetter',
  components: {
  },
  props: {
    tokenSetter: {
      type: TokenSetter,
      required: true
    },
    settings: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
        deletedialogopen: false,

       

        //isNumeric: [
        //    value => !isNaN(value) || 'Enter numeric value.'
        //]
    }
    
  },
  methods: {
      numKeyMonitor : function (ev){
            try {
                console.log('numKeyMonitor event: ' + ev);
                if (isNaN(ev)) console.log('Not a number');
                        //ev.preventDefault();
            } catch (error) {
                console.log('numKeyMonitor error: ' + error)
            }
            
          
          //this.$data.name = $event.target.value
      },

    tokenSetterDeleteAndCloseDialog : function (sheduleitemid, tokenid) {
        //console.log('tokenDeleteAndCloseDialog' + this.seetings);
        //console.log('tokenDeleteAndCloseDialog root' + this.settings.schedules.length);

        this.settings.schedules.forEach(schedule => {
            schedule.scheduleitems.forEach(si => {
                if (si.id == sheduleitemid) {
                    si.tokenSetters.forEach(ti => {
                        if (ti.id == tokenid){
                            var index = si.tokenSetters.indexOf(ti);
                            if (index !== -1) {
                                si.tokenSetters.splice(index, 1);
                                console.log('Deleted tokenSetter with id: ' + ti.id)
                                this.deletedialogopen=false;
                            }
                        }
                    })
                }
            })
        })
        
        
    },
  }

};
</script>

<style scoped>

</style>
