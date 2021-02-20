<template>
  <v-row no-gutters>
    <v-col cols="6">
      <v-text-field label="Token name" placeholder="Enter a token name"
                    v-model="token.name"></v-text-field>
    </v-col>
    <v-col cols="4">
      <v-chip color="primary">{{ token.type }}</v-chip>
    </v-col>
    <v-col cols="2">
      <v-dialog v-model="dialog"> <!-- max-width="290"-->
        <template v-slot:activator="{ on, attrs }">
          <v-btn fab dark x-small color="red" v-bind="attrs" v-on="on">
            <v-icon dark>mdi-delete-circle</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline">Delete Token?</v-card-title>
          <v-card-text>Do you want to delete token? All tokens in schedule will be removed!
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialog = false">No</v-btn>
            <v-btn color="red darken-1" text @click="dialog = false">Yes, delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'ScheduleToken',
  props: {
    token: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialog: false
    }
  }
};
</script>

<style scoped>

</style>
