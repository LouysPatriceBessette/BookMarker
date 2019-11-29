import {
    createStore
} from "redux"

// custom js functions
import currency from './js-lib/currency_format.js'
import rsg from './js-lib/random_string_gen.js'
import log from './js-lib/custom_log.js'
import {
    getRealType,
    map_O_spread
} from './js-lib/map_O_spread.js'

// Component keys
import key from 'weak-key'

// =================================================================================
let defaultStore = {

    // custom js functions
    functions: {
        currency: currency,
        log: log,
        getRealType: getRealType,
        map_O_spread: map_O_spread,
        rsg: rsg,

        // Component keys
        key: key
    },


    // Application variables NOT LOGGED
    logged: false,
    activeLink: -1,
}

// If a user cookie is found... Should be via a distach -- check in DB!
/*
let cookieVal = Cookies.get("session")
log.var("cookie", cookieVal)
if (cookieVal) {
    log.var("User session found!", cookieVal)
    log.var("user", Cookies.get("user"))
    let user = JSON.parse(Cookies.get("user"))
    log.var("user", Cookies.get("bankr"))
    let bank = JSON.parse(Cookies.get("bank"))

    defaultStore["logged"] = true
    defaultStore["userId"] = user.userId
    defaultStore["username"] = user.username
    defaultStore["bank"] = bank
}
*/

let reducer = (state, action) => {

    // State deep copy
    let newState = map_O_spread(state)

    // ================================================================================= Action dispatchers
    if (action.type === "modal") {
        newState.modal = action.content
        newState.overlay = true
    }
    if (action.type === "logged") {
        newState.logged = true
        newState.username = action.content.user.username
        newState.accessLevel = action.content.user.accessLevel
        newState.overlay = false
        newState.bank = action.content.bank
    }
    if (action.type === "logout") {
        newState.logged = false
        newState.username = null
        newState.accessLevel = null
        Cookies.set('session', 0, {
            expires: -1,
            path: ''
        })
        Cookies.set('user', 0, {
            expires: -1,
            path: ''
        })
        Cookies.set('bank', 0, {
            expires: -1,
            path: ''
        })
    }
    if (action.type === "sign-log-error") {
        newState.sl_error = true
    }
    if (action.type === "modalOverlayClick") {
        newState.overlay = false
        newState.sl_error = false
    }

    if (action.type === "link_detail") {
        newState.activeLink = action.content
    }

    if (action.type === "folder state") {
        log.var("catState in sote.js", action.catState)
        newState.bank.categories[action.content.catId].state = action.content.catState
    }

    return newState
}

// ================================================================================= STORE CREATION
const store = createStore(
    reducer,
    defaultStore,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
log.ok("Redux store created.")
export default store