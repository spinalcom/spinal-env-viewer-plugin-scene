<template>
    <v-container grid-list-md text-xs-center>
        <v-layout align-center justify-space-around row>
            <v-flex>
                <v-autocomplete
                        :reverse="true"
                        :dark="true"
                        id="autocomplete"
                        :attach="container"
                        v-model="model"
                        :items="attributesName"
                        label="Attribute name"
                        persistent-hint
                        prepend-icon="mdi-city"
                />
            </v-flex>

            <v-flex>
                <v-text-field
                        dark
                        input="attributeName"
                        @change="onValueChange"
                        label="Value"
                />
            </v-flex>
        </v-layout>
    </v-container>

</template>

<script>
  export default {
    name: "SelectAttribute",
    props: {
      attributesName: {
        type: Array,
        required: true
      },
      container: {
        type: Element,
        required: true
      },

    },
    data: function () {
      return {
        attributeName: "",
        model: null,
      }
    },

    methods: {
      onValueChange( e ) {
        this.$emit( 'value-change', {value: e, attribute: this.model} );
      }

    },
    watch: {
      model: function ( value ) {
        this.$emit( 'attribute-selected', value );
        console.log( value )
      }
    },

  }
</script>

<style scoped>

</style>