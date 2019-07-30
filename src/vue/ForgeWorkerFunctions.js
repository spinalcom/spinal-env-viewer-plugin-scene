export function filterDbid (m, attributeName, attributeVal){
  const fun = `function userFunction(pdb){
  const res = [];
  let attrNameId = -1;
  
  pdb.enumAttributes( (i, attrDef, attrRaw) => {
    let name = attrDef.name;
    
    if (name.toLowerCase() === \"${attributeName.toLowerCase()}\") {
      attrNameId = i;
      return true;
    }
  });
  
  pdb.enumObjects( (dbId) => {
    pdb.enumObjectProperties(dbId, (attrId, valId) => {
      if (attrId === attrNameId)
      {
        let value = pdb.getAttrValue(attrId, valId);
        
        if (value === \"${attributeVal}\") {
          res.push(dbId)
        }
        
        return true;
      }
    })
  });
  
  return {dbIds: res, attrId: attrNameId };
}
`;
  return m.getPropertyDb().executeUserFunction(fun);
}



export function getAttributeName(m){
  const fun = `function userFunction(pdb){
  const res = [];
  let attrNameId = -1;
  
  pdb.enumAttributes( (i, attrDef, attrRaw) => {
    let name = attrDef.name;
    console.log(attrDef.name)
    res.push(name)
  });
  
  return res;
}
`;
  
  
  return m.getPropertyDb().executeUserFunction(fun);
}