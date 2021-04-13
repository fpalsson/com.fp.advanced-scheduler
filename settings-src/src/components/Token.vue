<template>
    <v-row no-gutters>
        <v-col cols="6">
            <v-text-field :label="$t('Token_name')" :placeholder="$t('Enter_a_token_name')" v-model="token.name" :rules="requiredText"></v-text-field>
        </v-col>
        <v-col cols="4">
            <v-chip class="mt-4" color="primary">{{ translateTokenType(token.type) }}</v-chip>
        </v-col>
        <v-col cols="2">
            <!--v-btn fab dark x-small color="red"><v-icon dark>mdi-delete-circle</v-icon></v-btn-->

            <!--v-dialog v-model="tokendeletedialog[token.id]" -->
            <v-dialog v-model="deletedialogopen"> 
            <!--v-dialog v-model="tokendeletedialog[token.id].open" -->
                    <!--template v-slot:activator="{ on, attrs }">
                    <v-btn fab dark x-small color="red" v-bind="attrs" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn-->
                <template v-slot:activator="{ on }">
                    <v-btn fab dark x-small color="red" class="mt-4 text-right" v-on="on"><v-icon dark>mdi-delete-circle</v-icon></v-btn>
                </template>
                <v-card>
                    <v-card-title class="headline">{{ $t('Delete_token_question') }}</v-card-title>
                    <v-card-text>{{ $t('Do_you_want_to_delete_token_question') }}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <!--v-btn color="green darken-1" text @click="tokenCloseDeleteDialog(token.id)">No</v-btn-->
                        <v-btn color="green darken-1" text @click="deletedialogopen=false">{{ $t('No') }}</v-btn>
                        <v-btn color="red darken-1" text @click="tokenDeleteAndCloseDialog()">{{ $t('Yes_delete') }}</v-btn>
                    </v-card-actions>  
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>
</template>

<script>
import { Token } from '@/CommonContainerClasses'

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
      deletedialogopen: false,
      requiredText: [
        value => !!value || 'Required',
      ],

    }
  },
  methods: {
    tokenDeleteAndCloseDialog : function () {
        this.token.delete();
        this.deletedialogopen=false;
    },
    translateTokenType : function (type) {
      if (type=='boolean') return this.$t("Bool_token_desc");
      if (type=='number') return this.$t("Number_token_desc");
      if (type=='string') return this.$t("String_token_desc");
      return 'Unknown ' + type;
    },
  }
};
</script>

<style scoped>

</style>
