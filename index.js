import Vue from 'vue'
import Vuetify from 'vuetify'
import DialogCreateScene from "./src/vue/DialogCreateScene.vue";
import { SpinalForgeExtention } from "spinal-env-viewer-panel-manager-service_spinalforgeextention";


export const TOP_BAR_HOOK_NAME = 'GraphManagerTopBar';
export const SIDE_BAR_HOOK_NAME = "GraphManagerSideBar";
import {
  SpinalMountExtention
} from "spinal-env-viewer-panel-manager-service"
import {
  spinalContextMenuService,
} from "spinal-env-viewer-context-menu-service";

import { ButtonCreateScene } from "./src/buttons/ButtonCreateScene";
import { ButtonOpenSceneManager } from "./src/buttons/ButtonOpenSceneManager";
import { ButtonLoadScene} from "./src/buttons/ButtonLoadScene";
import PanelSceneManager from "./src/vue/PanelSceneManager.vue";


Vue.use( Vuetify );


if (!window.spinal.SpinalForgeViewer.isInitialize())
  window.spinal.SpinalForgeViewer.initialize(window.spinal.ForgeViewer.viewerManager);

spinalContextMenuService.registerApp( TOP_BAR_HOOK_NAME, new ButtonCreateScene(), [7] );
spinalContextMenuService.registerApp( SIDE_BAR_HOOK_NAME, new ButtonOpenSceneManager(), [7] );

spinalContextMenuService.registerApp( SIDE_BAR_HOOK_NAME, new ButtonLoadScene(), [7] );

SpinalMountExtention.mount( {
  // name registered.
  name: "DialogCreateScene",
  // Vue.extend to create a Compoment constructor
  vueMountComponent: Vue.extend( DialogCreateScene ),
  // where to  append the Compoment
  parentContainer: document.body
} );


const compareVersion =  SpinalForgeExtention.createExtention( {
  name: 'PanelSceneManager',
  vueMountComponent: Vue.extend( PanelSceneManager ),
  panel: {
    title: "Scene Manager",
    classname: "spinal-pannel",
    closeBehaviour: "delete"
  },
  style: {
    left: "805px",
    width: "430px",
    height: "80vh",
    display: "flex"
  }
} );


SpinalForgeExtention.registerExtention( "PanelSceneManager", compareVersion );

