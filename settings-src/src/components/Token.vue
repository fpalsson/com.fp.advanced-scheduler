<template>
    <v-row no-gutters>
        <v-col cols="6">
            <v-text-field label="Token name" placeholder="Enter a token name" v-model="token.name"></v-text-field>
        </v-col>
        <v-col cols="4">
            <v-chip color="primary">{{ token.type }}</v-chip>
        </v-col>
        <v-col cols="2">
            <!--v-btn fab dark x-small color="red"><v-icon dark>mdi-delete-circle</v-icon></v-btn-->

            <!--v-dialog v-model="tokendeletedialog[token.id]" -->
            <v-dialog v-model="deletedialogopen"> 
            <!--v-dialog v-model="tokendeletedialog[token.id].open" -->
                    <!--template v-slot:activator="{ on, attrs }">
                    <v-btn fab dark x-small color="red" v-bind="attrs" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn-->
                <template v-slot:activator="{ on }">
                    <v-btn fab dark x-small color="red" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn>
                </template>
                <v-card>
                    <v-card-title class="headline">Delete Token?</v-card-title>
                    <v-card-text>Do you want to delete token? All tokens in schedule will be removed!</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <!--v-btn color="green darken-1" text @click="tokenCloseDeleteDialog(token.id)">No</v-btn-->
                        <v-btn color="green darken-1" text @click="deletedialogopen=false">No</v-btn>
                        <v-btn color="red darken-1" text @click="tokenDeleteAndCloseDialog(token.id)">Yes, delete</v-btn>
                    </v-card-actions>  
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>
</template>

<script>
import Token from '../websettings'

export default {
  name: 'AsvToken',
  props: {
    token: {
      type: Token,
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
    tokenDeleteAndCloseDialog : function (tokenid) {
        //console.log('tokenDeleteAndCloseDialog' + this.seetings);
        //console.log('tokenDeleteAndCloseDialog root' + this.settings.schedules.length);

        this.settings.schedules.forEach(schedule => {
            schedule.tokens.forEach(token => {
                if (token.id == tokenid) {
                    var index = schedule.tokens.indexOf(token);
                    if (index !== -1) {
                        schedule.tokens.splice(index, 1);
                        console.log('Deleted token with id: ' +token.id)
                    }
                    schedule.scheduleitems.forEach(si => {
                        si.tokenitems.forEach(ti => {
                            if (ti.id==tokenid){
                                index = si.tokenitems.indexOf(ti);
                                if (index !== -1) {
                                    si.tokenitems.splice(index, 1);
                                    console.log('Deleted tokenitem with id: ' +ti.id)
                                }
                            }
                        })
                    })

                }
                this.deletedialogopen=false;
            })
        })
        
        
    },
  }

};
</script>

<style scoped>

</style>
