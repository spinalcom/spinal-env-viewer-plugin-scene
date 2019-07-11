import {
  SpinalContext,
  SpinalGraphService,
  SpinalNode
} from "spinal-env-viewer-graph-service";
import {
  PART_RELATION_NAME,
  PART_RELATION_TYPE,
  SCENE_RELATION_NAME,
  SCENE_RELATION_TYPE,
  SCENE_TYPE
} from "./constants";


class SceneHelper {
  static initialized = null;
  static context;
  static contextName;
  static type ;
  static contextId;
  
  
  static initialize() {
    if (SceneHelper.initialized !== null) {
      return SceneHelper.initialized;
    }
    
    SceneHelper.initialized = new Promise(( resolve, reject ) => {
      
      SceneHelper.context = SpinalGraphService.getContext( SceneHelper.contextName );
      if (typeof SceneHelper.context === "undefined") {
        SpinalGraphService.addContext(SceneHelper.contextName, SceneHelper.type).then(context => {
          SceneHelper.context = context;
    
          SceneHelper.contextId = context.info.id.get();
          console.log(SceneHelper);
          console.log(SceneHelper.contextId);
          resolve(true);
        }).catch(reject);
      }
      else{
        SceneHelper.contextId = SceneHelper.context.info.id.get();
        console.log(SceneHelper.contextId);
        resolve( true );
      }
    });
    return SceneHelper.initialized;
  }
  
  static createScene( name, description, autoLoad ) {
    return SceneHelper.initialize().then( () => {
      const sceneId = SpinalGraphService.createNode( {
        name,
        description,
        autoLoad,
        type: SCENE_TYPE
      }, undefined );
      return SpinalGraphService.addChildInContext( SceneHelper.contextId,
        sceneId, SceneHelper.contextId, SCENE_RELATION_NAME, SCENE_RELATION_TYPE );
    } );
    
  }
  
  static addModelToScene( sceneId, bimFileId ) {
    return SceneHelper.initialize()
      .then( () => {
        return SpinalGraphService.addChildInContext( sceneId, bimFileId, SceneHelper.contextId,
          PART_RELATION_NAME, PART_RELATION_TYPE );
      } )
  }
  
  static getBimFilesFromScene( sceneId ) {
    return SceneHelper.initialize().then( () => {
      return SpinalGraphService.getChildren( sceneId, [PART_RELATION_NAME] );
    } )
  }
  
  static getSceneFromNode( nodeId ) {
    return SceneHelper.initialize().then( () => {
      return SpinalGraphService.getChildren( nodeId, [SCENE_RELATION_NAME] )
      
    } )
  }
  
  static addSceneToNode( nodeId, sceneId ) {
    return SceneHelper.initialize().then( () => {
      return SpinalGraphService.addChildInContext( nodeId, sceneId, SceneHelper.contextId, SCENE_RELATION_NAME, SCENE_RELATION_TYPE );
    } )
  }
  
}

SceneHelper.initialized = null;
SceneHelper.contextName = "Scenes";
SceneHelper.type = "SpinalService";

export {SceneHelper};