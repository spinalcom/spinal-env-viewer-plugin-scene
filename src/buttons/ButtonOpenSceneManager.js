/*
 * Copyright 2019 SpinalCom - www.spinalcom.com
 *
 *  This file is part of SpinalCore.
 *
 *  Please read all of the following terms and conditions
 *  of the Free Software license Agreement ("Agreement")
 *  carefully.
 *
 *  This Agreement is a legally binding contract between
 *  the Licensee (as defined below) and SpinalCom that
 *  sets forth the terms and conditions that govern your
 *  use of the Program. By installing and/or using the
 *  Program, you agree to abide by all the terms and
 *  conditions stated or referenced herein.
 *
 *  If you do not agree to abide by these terms and
 *  conditions, do not demonstrate your acceptance and do
 *  not install or use the Program.
 *  You should have received a copy of the license along
 *  with this file. If not, see
 *  <http://resources.spinalcom.com/licenses.pdf>.
 */

import { SpinalContextApp } from 'spinal-env-viewer-context-menu-service';
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { SCENE_TYPE } from "../constants";


const { spinalPanelManagerService } = require( "spinal-env-viewer-panel-manager-service" );

export class ButtonOpenSceneManager extends SpinalContextApp {
  
  constructor() {
    super( 'Open Model Manager', 'Open Model Manager', {
      icon: 'web',
      icon_type: 'in',
      backgroundColor: '#000000',
      fontColor: '#ffffff'
    } );
    
    this.action = this.openPanel.bind( this );
  }
  
  isShown( option ) {
    
    if (option.selectedNode.type.get() === SCENE_TYPE)
      return Promise.resolve( true );
    return Promise.resolve(-1);
  }
  
  
  
  openPanel( option ) {
    console.log(option);
    const context = SpinalGraphService.getContext( 'BimFileContext' );
    const promises = [];
    
    SpinalGraphService.getChildrenInContext( context.info.id.get(), context.info.id.get() )
      .then( children => {
        
        spinalPanelManagerService.openPanel( "PanelSceneManager", { scene: option.selectedNode,  bimFiles: children} );
        
        
      } )
  }
}