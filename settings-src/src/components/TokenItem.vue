<template>
    <v-row no-gutters>
        <v-col cols="5" class="mt-4">
            {{ tokenitem.token.name }}
        </v-col>
        <v-col cols="5">
            <v-text-field v-if="tokenitem.token.type==='string'" label="Token Item value string" placeholder="Enter a string value" v-model="tokenitem.value"></v-text-field>
            <v-text-field v-if="tokenitem.token.type==='number'" label="Token Item value number" placeholder="Enter a number value" v-model="tokenitem.value"></v-text-field>
            <v-switch v-if="tokenitem.token.type==='boolean'" label="Value" v-model="tokenitem.value"></v-switch>
            
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
                        <!--v-btn color="green darken-1" text @click="tokenCloseDeleteDialog(token.id)">No</v-btn-->
                        <v-btn color="green darken-1" text @click="deletedialogopen=false">No</v-btn>
                        <v-btn color="red darken-1" text @click="tokenItemDeleteAndCloseDialog(token.id)">Yes, delete</v-btn>
                    </v-card-actions>  
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>
</template>

<script>
import { TokenItem } from '../websettings'

export default {
  name: 'AsvTokenItem',
  props: {
    tokenitem: {
      type: TokenItem,
      required: true
    },
    settings: {
      type: Object,
      required: true
    }

  },
  data() {
    return {
      deletedialogopen: false
    }
  },
  methods: {
    tokenItemDeleteAndCloseDialog : function (sheduleitemid, tokenid) {
        //console.log('tokenDeleteAndCloseDialog' + this.seetings);
        //console.log('tokenDeleteAndCloseDialog root' + this.settings.schedules.length);

        this.settings.schedules.forEach(schedule => {
            schedule.scheduleitems.forEach(si => {
                if (si.id == sheduleitemid) {
                    si.tokenitems.forEach(ti => {
                        if (ti.id == tokenid){
                            var index = si.tokenitems.indexOf(ti);
                            if (index !== -1) {
                                si.tokenitems.splice(index, 1);
                                console.log('Deleted tokenitem with id: ' + ti.id)
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
