import { SpinalContextApp } from 'spinal-env-viewer-context-menu-service';
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { SCENE_TYPE } from "../constants";


const { spinalPanelManagerService } = require( "spinal-env-viewer-panel-manager-service" );

export class ButtonLoadScene extends SpinalContextApp {
  
  constructor() {
    super( 'Load Scene', 'Load all model of the scene', {
      icon: 'get_app',
      icon_type: 'in',
      backgroundColor: '#000000',
      fontColor: '#ffffff'
    } );
    
    this.action = this.openPanel.bind( this );
  }
  
  isShown( option ) {
    if (option.selectedNode.type.get() === SCENE_TYPE)
      return Promise.resolve( true );
    return Promise.resolve( -1 );
  }
  
  openPanel(option) {
    window.spinal.SpinalForgeViewer.loadModelFromNode(option.selectedNode.id.get())
    console.log(option)
  }
}