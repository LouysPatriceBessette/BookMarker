import { createStore } from "redux"
import log from './js-lib/custom_log.js'
import Cookies from 'js-cookie';
import {getRealType,map_O_spread} from './js-lib/map_O_spread.js'

let cookieVal = Cookies.get("session")
log.var("cookie",cookieVal)

let defaultStore =  { logged:false, activeLink: -1 }

if(cookieVal){
    log.var("User session found!", cookieVal)
    log.var("user",Cookies.get("user"))
    let user = JSON.parse(Cookies.get("user"))
    log.var("user",Cookies.get("bankr"))
    let bank = JSON.parse(Cookies.get("bank"))

    defaultStore =  {
        logged:true, 
        userId:user.userId,
        username:user.username, 
        accessLevel:user.accessLevel, 
        bank:bank,
        activeLink: -1
    }
}


let reducer = (state, action) => { 
    
    let newState = map_O_spread(state)

    if(action.type==="modal"){
        newState.modal = action.content
        newState.overlay = true
    }
    if(action.type==="logged"){
        newState.logged = true
        newState.username = action.content.user.username
        newState.accessLevel = action.content.user.accessLevel
        newState.overlay = false
        newState.bank = action.content.bank
    }
    if(action.type==="logout"){
        newState.logged = false
        newState.username = null
        newState.accessLevel = null
        Cookies.set('session', 0, { expires: -1, path: '' })
        Cookies.set('user', 0, { expires: -1, path: '' })
        Cookies.set('bank', 0, { expires: -1, path: '' })
    }
    if(action.type==="sign-log-error"){
        newState.sl_error = true
    }
    if(action.type==="modalOverlayClick"){
        newState.overlay = false
        newState.sl_error = false
    }

    if(action.type==="link_detail"){
        newState.activeLink = action.content
    }

    if(action.type==="folder state"){
        log.var("catState in sote.js",action.catState)
        newState.bank.categories[action.content.catId].state = action.content.catState
    }

    return newState  
} 
const store = createStore( 
    reducer, 
    defaultStore, 
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() 
) 
log.ok("Redux store created.")
export default store