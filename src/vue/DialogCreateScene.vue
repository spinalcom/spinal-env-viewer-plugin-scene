<template>
    <v-app>
        <v-layout row justify-center>
            <v-dialog v-model="dialog" max-width="290">
                <v-card :dark="true">
                    <v-card-title class="headline">Create a new scene
                    </v-card-title>
                    <v-card-text>
                        <v-text-field
                                placeholder="Name"
                                @change="onNameChange"
                        />

                        <v-text-field
                                placeholder="Description"
                                @change="onNameChange"
                        />

                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red darken-1"
                               flat
                               @click="onCancel">Annuler
                        </v-btn>

                        <v-btn color="green darken-1"
                               flat
                               @click="onSave">Valider
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-layout>
    </v-app>
</template>

<script>
  import { SceneHelper } from "../build/SceneHelper";

  export default {
    name: "DialogCreateScene",

    data: function () {
      return {
        name: "",
        description: "",
        dialog: false,
        bimFile: []
      }
    },
    methods: {
      initialize: function ( option ) {
      },
      onNameChange: function ( value ) {
        this.name = value;
      },
      onDescriptionChange: function ( value ) {
        this.description = value;
      },
      createScene: function () {
        return new Promise( resolve => {
          SceneHelper.createScene( this.name, this.description,
            false ).then( resolve )
        } )
      },
      onSave: function () {
        this.createScene()
          .then( () => {
            this.dialog = false;
          } );
      },
      onCancel: function () {
        this.dialog = false;
      },
      opened: function ( option ) {
        this.initialize( option );
        this.dialog = true;
      },
      removed: function () {

      },
      closeDialog( closeResult ) {

      }
    }
  }
</script>

<style scoped>

</style>
