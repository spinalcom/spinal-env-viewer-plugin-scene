<template>

    <v-layout wrap align-center>
        <v-flex xs12 sm6 d-flex>

            <v-text-field
                    dark
                    input="attributeName"
                    @change="onValueNameChange"
                    label="Value"
            ></v-text-field>
            <div v-if="attributeName.length > 0">
                <v-card>
                    <div @click="console.log(attributeName)"
                         v-for="attributeName in attributesName">
                        {{attributeName}}
                    </div>
                </v-card>
            </div>
        </v-flex>
        <v-flex xs12 sm6 d-flex>
            <v-text-field
                    dark
                    @change="onValueNameChange"
                    label="Value"
            ></v-text-field>
        </v-flex>
    </v-layout>


    <v-btn v-if="currentModel !== null"
           @click="onSearchAttribute">search
    </v-btn>
    <v-btn v-else
           @click="loadModel">load
    </v-btn>

</template>

<script>
  export default {
    name: "SelectAttribute",
    props: {
      attributesName: {
        type: Array,
        required: true
      }
    },
    data: function () {
      return {
        attributeName: ""
      }
    }

  }
</script>

<style scoped>

</style>