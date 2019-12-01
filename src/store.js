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
import qf from './js-lib/qf.js'

// Component keys
import key from 'weak-key'

// Cookie remove
import Cookies from "js-cookie";

// =================================================================================
let defaultStore = {

    // custom js functions
    functions: {
        currency: currency,
        log: log,
        getRealType: getRealType,
        map_O_spread: map_O_spread,
        rsg: rsg,
        qf: qf,

        // Component keys
        key: key
    },

    // Application variables NOT LOGGED
    logged: false,
    activeCat: -1,
    activeLink: -1,
    unsavedChanges: false
}


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
        newState.overlay = false
        newState.categories = action.content.user.categories
        newState.links = action.content.user.links
    }
    if (action.type === "logout") {
        newState.logged = false
        newState.username = null
        Cookies.set('sid', 0, {
            expires: -1
        })
    }
    if (action.type === "sign-log-error") {
        newState.sl_error = true
    }
    if (action.type === "modalOverlayClick") {
        newState.overlay = false
        newState.sl_error = false
    }

    if (action.type === "folder state") {
        // modifies the Store categories
        newState.categories[action.catId].state = action.catState
        // Set active category
        newState.activeCat = action.catId
    }

    if (action.type === "link detail") {
        // Set active link
        newState.activeLink = action.linkId
        // Set active category
        newState.activeCat = action.catId
    }

    if (action.type === "change rating") {
        newState.links[action.activeLink].rating = action.rating

        // Changes!
        newState.unsavedChanges = true
    }

    // Adds a folder to the Redux store categories
    if (action.type === "folder add") {
        newState.categories.push({
            name: action.folderName,
            content: [],
            state: "closed"
        })

        // Close modal
        newState.overlay = false
        newState.sl_error = false

        // Changes!
        newState.unsavedChanges = true
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