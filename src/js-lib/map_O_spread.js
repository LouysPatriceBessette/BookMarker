// ==================================== Get the REALtype of a variable
let getRealType = (el=>{
    let type;
  
    switch(true){
      case ( el === undefined ):
        type = "undefined"
        break
      case ( el === null ):
        type = "null"
        break
      case ( Array.isArray( el ) ):
        type = "array"
        break
      case ( el instanceof Function ):
        type = "function"
        break
      case ( el instanceof Object ):
        type = "object"
        break
      default:
        type = typeof(el)
    }
    return type
  })
  
 // ==================================== Deep copy function
  let map_O_spread = O =>{
  
    // If not an array AND not an object
    if ( getRealType(O) !== "array" && getRealType(O) !== "object" ) {
      return O
    }
    
    // if an array
    if ( getRealType(O) === "array" ){
      return O.map((o)=>{
          return map_O_spread(o)
      })
    }
  
    // if an object
    if ( getRealType(O) === "object" ){
      let keys = Object.keys(O)
      
      let map_O_Spreaded_object = {}
      keys.forEach(k=>{
        map_O_Spreaded_object[k] = map_O_spread(O[k])
      })
      return map_O_Spreaded_object
    }
  }

  export {getRealType,map_O_spread}