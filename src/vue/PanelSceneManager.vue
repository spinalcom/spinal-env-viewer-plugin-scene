<template>
    <div class="scene-manager-vue">
        <v-container grid text-xs-center dark>
            <div v-if="!modifyModelItem">
                <h1 class="scene-manager-vue-title">{{sceneName}}</h1>
                <h2 v-if="description.length > 0">{{description}}</h2>
                <div class="associated-model">
                    <h3>Scene's model</h3>

                    <ul class="associated-model-list"
                        v-if="associatedModel.length > 0">
                        <li class="associated-model-item"
                            v-for="model in associatedModel">
                            <p class="associated-model-item-name">
                                {{model.name.get()}}
                            </p>
                            <v-btn @click="openEditModel(model)"
                                   flat icon small dark
                            >
                                <v-icon dark>edit</v-icon>
                            </v-btn>
                            <v-btn @click=" deleteAssociatedModel(model)"
                                   flat icon small dark
                            >
                                <v-icon dark>delete</v-icon>
                            </v-btn>
                        </li>
                    </ul>
                    <div v-else> No model associated to this scene</div>
                </div>
                <div class="bim-file-selector" v-if="isBimFileSelectorOpen">
                    <div class="bim-file-selector-header">
                        <v-btn flat icon small dark
                               class="bim-file-selector-closer"
                               @click="isBimFileSelectorOpen = false"
                        >
                            <v-icon dark>close</v-icon>
                        </v-btn>
                    </div>

                    <div class="bim-file-selector-body">
                        <ul>
                            <li v-for="bimFile in bimFiles"
                                class="bim-file-selector-item">
                                {{bimFile.name.get()}}
                                <v-btn @click="() => { addModelToScene(bimFile) }"
                                       flat icon small dark
                                >
                                    <v-icon dark>add</v-icon>
                                </v-btn>
                            </li>
                        </ul>
                    </div>
                </div>
                <v-btn class="open-bim-file-selector-fab"
                       fab small dark v-if="!isBimFileSelectorOpen"
                       @click="isBimFileSelectorOpen = true"
                >
                    <v-icon dark>add</v-icon>
                </v-btn>
            </div>
            <div v-if="modifyModelItem">

                <v-text-field
                        label="Attribute"
                        @change="onAttributeNameChange"
                        dark
                ></v-text-field>


                <v-text-field
                        dark
                        @change="onValueNameChange"
                        label="Value"
                ></v-text-field>


                <v-btn v-if="currentModel !== null"
                       @click="onSearchAttribute">search
                </v-btn>
                <v-btn v-else
                       @click="loadModel">load
                </v-btn>


            </div>
        </v-container>
    </div>
</template>

<script>
  import { SceneHelper } from "../build/SceneHelper";
  import{SpinalGraphService} from "spinal-env-viewer-graph-service"
  import { test } from "./test";

  export default {
    name: "PanelSceneManager",
    data: function () {
      return {
        scene: null,
        bimFiles: [],
        associatedModel: [],
        isBimFileSelectorOpen: false,
        modifyModelItem: false,
        currentModel: null,
        currentBimeFile: null,
        attributeName: "",
        attributeVal: ""
      }
    },
    computed: {
      sceneName: function () {
        if (this.scene !== null)
          return this.scene.name.get();
        return ""
      },
      description: function () {
        if (this.scene !== null)
          return this.scene.description.get();

        return "";
      }
    },
    methods: {
      initialize: function ( option ) {
        this.bimFiles = option.bimFiles;
        console.log( option.bimFiles );
        this.scene = option.scene;
        SceneHelper.getBimFilesFromScene( this.scene.id.get() )
          .then(
            bimFile => {
              this.associatedModel = bimFile;
            }
          )
      },
      openBimFileSelector: function () {

      },
      opened: function ( option ) {
        console.log( option )
        this.initialize( option );
      },
      removed: function () {

      },
      closeDialog: function ( closeResult ) {

      },
      addModelToScene: function ( bimFile, sure ) {
        SceneHelper.addModelToScene( this.scene.id.get(), bimFile.id.get() ).then(
          () => {
            this.associatedModel.push( bimFile );
          }
        )
      },
      openEditModel: function ( m ) {
        this.currentBimFile = m;
        this.currentModel = window.spinal.SpinalForgeViewer.getModel( m.id.get() );
        this.modifyModelItem = true;

        console.log( "edit model", m )
      },
      onAttributeNameChange: function ( value ) {
        this.attributeName = value;
        console.log( `attribute name change: ${value}` )
      },
      onValueNameChange: function ( value ) {
        this.attributeVal = value;
        console.log( `value name change: ${value}` )
      },
      getAllDbIdsRec( model, callback ) {

        let cbCount = 0; // count pending callbacks
        const components = []; // store the results
        let tree; // the instance tree

        function getLeafComponentsRec( parent ) {
          cbCount++;
          if (tree.getChildCount( parent ) !== 0) {
            tree.enumNodeChildren( parent, function ( children ) {
              getLeafComponentsRec( children );
            }, false );
          } else {
            components.push( parent );
          }

          if (--cbCount === 0) callback( components );
        }

        model.getObjectTree( function ( objectTree ) {
          tree = objectTree;
          var allLeafComponents = getLeafComponentsRec( tree.getRootId() );
        } );
      },
      onSearchAttribute: function () {
        const attributeName = this.attributeName.toLowerCase();
        test( this.currentModel, this.attributeName, this.attributeVal ).then( ( res ) => {
          console.log(res, this.currentModel);
          SpinalGraphService.waitForInitialization().then(() =>
          {SpinalGraphService.modifyNode(this.scene.id.get(),
            {options: [{urn: this.currentModel.getData().urn,
                dbIds: res.dbIds}]})})
          window.spinal.ForgeViewer.viewerManager
            .isolate( res.dbIds, this.currentModel )
        } ).catch( console.error );
      },


      loadModel: function () {
        window.spinal.SpinalForgeViewer.loadBimFile( this.currentBimFile ).then( m => {
          console.log( m );
          this.currentModel = m.model;
        } )
      }
    }
  }
</script>

<style scoped>


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



    .associated-model-item-name{
        width: 80%;
        text-overflow: ellipsis;
        overflow: hidden;
        margin: 0
    }
</style>