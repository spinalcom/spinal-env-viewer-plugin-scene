import { SpinalContextApp } from 'spinal-env-viewer-context-menu-service';
import { SCENE_TYPE } from "../constants";


const { spinalPanelManagerService } = require( "spinal-env-viewer-panel-manager-service" );

export class ButtonLoadModel extends SpinalContextApp {
  
  constructor() {
    super( 'Load model', 'Load model', {
      icon: 'get_app',
      icon_type: 'in',
      backgroundColor: '#000000',
      fontColor: '#ffffff'
    } );
    
    this.action = this.openPanel.bind( this );
  }
  
  isShown( option ) {
    //Todo create specific service
    if (option.selectedNode.type.get() === 'BimFile')
      return Promise.resolve( true );
    return Promise.resolve( -1 );
  }
  
  openPanel(option) {
    console.log(window.spinal.SpinalForgeViewer)
    window.spinal.SpinalForgeViewer.loadModelFromBimFile(option.selectedNode)
  }
}