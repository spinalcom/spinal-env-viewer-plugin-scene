<template>


    <v-app class="scene-manager" dark>
        <v-stepper
                vertical
                dark
                v-model="step"
        >


            <v-stepper-step
                    editable
                    :complete="step > 1"
                    step="1"
            >
                Select models
            </v-stepper-step>
            <v-stepper-content step="1" id="step1">

                <v-select
                        v-model="selectedModels"
                        :items="bimFilesComputed"
                        label="Models"
                        multiple
                        hint="Choose the model to add to the scene"
                        persistent-hint
                        :attach="container"
                >
                </v-select>


            </v-stepper-content>

            <v-stepper-step
                    editable
                    :complete="step > 2"
                    step="2"
            >
                Choose referential
            </v-stepper-step>
            <v-stepper-content step="2" id="step2">
                <v-checkbox
                        v-model="useAllModels"
                        label="Use whole digital twin"
                ></v-checkbox>

                <div v-if="!useAllModels">
                    <v-layout align-center justify-space-around row>
                        <v-flex>
                            <v-btn flat icon @click="getSelection">
                                <v-icon>add</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex>
                            <v-btn flat icon @click="clearSelection">
                                <v-icon>close</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex>
                            <v-btn flat icon @click="selectOBJ">
                                <v-icon>visibility</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                    <div v-if="displayNeedToLoadModel">
                        Models need to be loaded to see the selection
                        <v-btn flat icon
                               @click="loadAllModel">
                            <v-icon>get_app</v-icon>
                        </v-btn>
                    </div>
                    {{objectSelectedSentence}}

                </div>
            </v-stepper-content>

            <v-stepper-step
                    editable
                    :complete="step > 2"
                    step="3"
            >
                Edit scene
            </v-stepper-step>
            <v-stepper-content step="3" id="step3">
                <v-checkbox
                        v-model="autoLoad"
                        label="load the scene automatically"
                ></v-checkbox>
                <v-text-field
                        v-model="sceneName"
                        label="Name"
                        :placeholder="name"
                ></v-text-field>
                <v-text-field
                        v-model="sceneDescr"
                        label="Description"
                        :placeholder="description"
                ></v-text-field>
            </v-stepper-content>

            <v-stepper-step
                    editable
                    step="4"
            >
                Summary
            </v-stepper-step>
            <v-stepper-content step="4" id="step4">
                {{nbModel}} model include in this scene
                <div v-for="model in selectedModelInfo">
                    {{model.name}} with {{getDbIdLength()}} object selected
                    <v-btn v-if=" typeof model.dbIds !==
                    'undefined' && getDbIdLength() > 0"
                           flat
                           icon @click="selectOBJ">
                        <v-icon>visibility</v-icon>
                    </v-btn>
                </div>
                <v-btn flat @click="save">
                    Save
                </v-btn>
            </v-stepper-content>
        </v-stepper>
    </v-app>

</template>

<script>
  import { SceneHelper } from "../build/SceneHelper";
  import { SpinalGraphService } from "spinal-env-viewer-graph-service"
  import {
    filterDbid,
    getAttributeName
  } from "./ForgeWorkerFunctions";
  import SelectAttribute from "./SelectAttribute.vue";
  import {
    PART_RELATION_NAME,
    PART_RELATION_TYPE
  } from "../constants";
  
  export default {
    name: "PanelSceneManager",
    components: { SelectAttribute },
    data: function () {
      return {
        step1Container: null,
        step2Container: null,
        step3Container: null,

        displayNeedToLoadModel: false,
        modelLoaded: false,
        selection: { nb: 0 },
        models: {},
        useAllModels: true,
        autoLoad: false,
        selectedModels: [],
        bimFilesComputed: [],
        step: 1,
        scene: null,
        bimFiles: [],

        sceneName: "",
        sceneDescr: "",
        
        
        associatedModel: [],
        attributesName: [],
        isBimFileSelectorOpen: false,
        modifyModelItem: false,
        modelNeedToBeLoad: false,
        currentModel: null,
        
        attributeName: "",
        attributeVal: "",
        container: null,
        numberProps: 0,
        modelProps: {},

      }
    },
    watch: {
      selectedModel: function ( value ) {
        for (let i = 0; i < value.length; i++) {
          if (typeof this.modelLoaded[value[i]] !== "undefined" && this.modelLoaded[value[i]])
            continue;
          for (let j = 0; j < this.bimFiles.length; j++) {
            if (this.bimFiles[j].name.get() === value[i]) {
              this.currentBimFile = this.bimFiles[j];
              this.loadModel()
                .then( () => {
                  this.modelLoaded[value[i]] = true;
                } )
            }
          }
        }
      }
    },
    computed: {
      name: function () {
        if (this.scene !== null)
          return this.scene.name.get();
        return ""
      },
      description: function () {
        if (this.scene !== null)
          return this.scene.description.get();
        
        return "";
      },
      nbModel: function () {
        return this.selectedModels.length;
      },
      selectedModelInfo: function () {
        //if here to be trigger when selection change
        if (this.selection.nb !== 0)
          return this.selectedModels.map( m => this.getModelInfo( m ) );
        else
          return this.selectedModels.map( m => this.getModelInfo( m ) );
      },
      objectSelectedSentence: function () {
        if (this.selection.nb <= 1)
          return `${this.selection.nb} object selected`;
        return `${this.selection.nb} objects selected`;
      }
    },
    methods: {
      initialize: function ( option ) {
        this.container = this.$el;
        this.selection.nb = 0;
        this.step1Container = document.getElementById( "step1" );
        this.step2Container = document.getElementById( "step2" );
        this.step3Container = document.getElementById( "step3" );
        this.bimFiles = option.bimFiles;
        this.scene = option.scene;

        this.bimFilesComputed = this.bimFiles
          .map( bimfile => { return bimfile.name.get()} );
        
        this.useAllModels = typeof this.scene.useAllModels !== "undefined" ?
          this.scene.useAllModels.get() : false;

        this.autoLoad = this.scene.autoLoad.get();
        if (typeof this.scene.option !== "undefined") {
          for (let i = 0; i < this.scene.options; i++) {
            this.selection.nb += this.scene.options[i].dbIds.get().length;
          }
        }
        SceneHelper.getBimFilesFromScene( this.scene.id.get() )
          .then(
            bimFiles => {
              this.selectedModels = bimFiles.map( bimFile => bimFile.name.get() );
            }
          )
      },
      getDbIdLength: function ( model ) {
        if (typeof model !== "undefined" && typeof model.dbIds !== "undefined")
          return model.dbIds.length
        return 0;
      },
      openBimFileSelector: function () {
        
      },
      opened: function ( option ) {
        this.initialize( option );
      },
      removed: function () {
        
      },
      closeDialog: function ( closeResult ) {
        
      },
      addModelToScene: function ( bimFile ) {
        SceneHelper.addModelToScene( this.scene.id.get(), bimFile.id.get() ).then(
          () => {
            this.associatedModel.push( bimFile );
          }
        )
      },
      getModelInfo( m ) {
        const info = {
          name: "",
          dbIds: []
        };
        info['name'] = m;
        
        const model = window.spinal.BimObjectService.getModelByName( m );
        if (typeof model === "undefined")
          return info;
        
        info['model'] = model;
        info['dbIds'] = this.selection[model.id];
        return info;
      },
      loadModel: function () {
        return window.spinal.SpinalForgeViewer.loadBimFile( this.currentBimFile )
          .then( m => {
            this.currentModel = m.model;
            this.modelNeedToBeLoad = false;
            return true;
          } )
      },

      loadAllModel() {
        const proms = [];
        for (let i = 0; i < this.bimFiles.length; i++) {
          proms.push( window.spinal.SpinalForgeViewer.loadBimFile( this.bimFiles[i] ) )
        }
        Promise.all( proms ).then( () => {
          this.displayNeedToLoadModel = false;
          this.modelLoaded = true;
        } );
      },
      selectOBJ: function () {
        if (Object.keys( this.selection ).length === 1 && !this.modelLoaded)
          this.displayNeedToLoadModel = true;
        spinal.ForgeViewer.viewer.clearSelection();
        for (let key in this.selection) {
          if (this.selection.hasOwnProperty( key ) && key !== "nb") {
            console.log( key );
            console.log( this.models[key] );

            this.models[key].selector.setSelection( this.selection[key],
              Autodesk.Viewing.SelectionMode )
            // window.spinal.ForgeViewer.viewerManager.select(
            // this.selection[key], this.models[key] )
          }
        }
      },
      getSelection: function () {
        
        const selection =
          window.spinal.ForgeViewer.viewer.getAggregateSelection();
        
        for (let i = 0; i < selection.length; i++) {
          if (selection[i].hasOwnProperty( "model" )) {
            let dbids = this.selection[selection[i].model.id];
            if (typeof dbids === "undefined")
              dbids = [];

            const newIds = selection[i].selection
              .filter( dbid => { return dbids.indexOf( dbid ) === -1} );

            dbids.push( ...newIds );
            this.selection[selection[i].model.id] = dbids;
            this.models[selection[i].model.id] = selection[i].model;
          }
        }
        let res = 0;
        for (let key in this.selection) {
          if (this.selection.hasOwnProperty( key ) && key !== "nb") {
            res += this.selection[key].length;
          }

        }
        this.selection['nb'] = res;
      },
      clearSelection: function () {
        this.selection = { nb: 0 };
      },
      save: function () {
        const info = {};
        info['autoLoad'] = this.autoLoad;
        if (this.sceneDescr !== "")
          info['description'] = this.sceneDescr;
        if (this.sceneName !== "")
          info['name'] = this.sceneName;
        info['useAllDT'] = this.useAllModels;

        info['options'] = [];// [{urn: "", dbIds: []}]
        for (let i = 0; i < this.selectedModels.length; i++) {
          const modelName = this.selectedModels[i];
          let model = window.spinal.BimObjectService.getModelByName( modelName );
          let bimFile = this.bimFiles.find( file => file.name.get() === modelName );
          console.log( 'das', bimFile );
          if (typeof model !== 'undefined') {
            info['options'].push( {
              urn: model.myData.urn,
              dbIds: this.selection[model.id]
            } );
          }
        }
        SpinalGraphService.getChildren( this.scene.id.get(),
          [PART_RELATION_NAME] ).then( children => {
          const nodeToRemove = [];
          const nodeToAdd = [];

          if (typeof children !== "undefined") {

            for (let i = 0; i < children.length; i++) {
              if (this.selectedModels.indexOf( children[i].name.get() ) === -1)
                nodeToRemove.push( SpinalGraphService
                  .removeChild( this.scene.id.get(), children[i].id.get(),
                    PART_RELATION_NAME, PART_RELATION_TYPE ) );
            }

            for (let i = 0; i < this.selectedModels.length; i++) {
              const node = children.find( child => {
                  return child.name.get() === this.selectedModels[i]
                }
              );

              const bimFile = this.bimFiles.find( file => {
                  return file.name.get() === this.selectedModels[i]
                }
              );

              if (typeof node === "undefined" && typeof bimFile !== "undefined")
                nodeToAdd.push( SceneHelper.addModelToScene(
                  this.scene.id.get(), bimFile.id.get() ) )

            }


          } else {
            for (let i = 0; i < this.selectedModels.length; i++) {

              const bimFile = this.bimFiles.filter( file => {
                  return file.name.get() === this.selectedModels[i]
                }
              );

              nodeToAdd.push( SceneHelper.addModelToScene(
                this.scene.id.get(), bimFile.id.get() ) )
            }
          }
          Promise.all( nodeToRemove )
            .then( () => {
              Promise.all( nodeToAdd )
                .then(() => {
                  SpinalGraphService.modifyNode( this.scene.id.get(), info )
                })
            } )
        } );

      }
      
    }
  }
</script>

<style scoped>

    .scene-manager {
        overflow: hidden;
    }

    .application--wrap * {
    }

    .scene-manager-vue {
        height: calc(100% - 20px);
        width: 100%;
        overflow: hidden;
    }

    .scene-manager-vue * {
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
    }

    .associated-model {
        padding: 10px;
        margin: 10px;
        border: 1px solid rgba(128, 128, 128, 0.70);
    }

    .associated-model-item {
        text-align: start;
        border: 1px solid rgba(128, 128, 128, 0.64);
        margin: 8px;
        padding: 4px;
        display: flex;
        align-items: center;
        align-content: center;
    }


    .open-bim-file-selector-fab {
        position: absolute;
        bottom: 10px;
        right: 0px;
    }


    .bim-file-selector {
        border: 1px solid rgba(128, 128, 128, 0.64);
        margin: 10px;
        position: relative;
    }

    .bim-file-selector-header {
        display: flex;
        justify-content: flex-end;
    }

    .bim-file-selector-item {
        display: flex;
        margin: 8px;
        padding: 4px;
        border: 1px solid rgba(128, 128, 128, 0.64);
        align-content: center;
        align-items: center;

    }

    .bim-file-selector-closer {

    }

    .bim-file-selector-body {
        margin: 8px;
    }

    ul {
        list-style: none;
        padding: unset;
    }


    .associated-model-item-name {
        width: 80%;
        text-overflow: ellipsis;
        overflow: hidden;
        margin: 0
    }
</style>