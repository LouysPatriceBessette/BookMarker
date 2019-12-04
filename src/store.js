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
import date_time from "./js-lib/date_time_format.js"

// Component keys
import key from 'weak-key'

// Cookie remove
import Cookies from "js-cookie";

// ========================================================================================== Default store
let defaultStore = {

    // custom js functions
    functions: {
        currency: currency,
        log: log,
        getRealType: getRealType,
        map_O_spread: map_O_spread,
        rsg: rsg,
        qf: qf,
        date_time: date_time,

        // Component keys
        key: key
    },

    // Application variables NOT LOGGED
    logged: false,
    activeCat: -1,
    activeLink: -1,
    unsavedChanges: false,
    unsavedChanges_detail: [],
    unsavedShown: false
}


let reducer = (state, action) => {

    // State deep copy
    let newState = map_O_spread(state)

    // ========================================================================================== Action dispatchers

    // =========================================================== Modal
    if (action.type === "modal") {
        newState.modal = action.content
        newState.overlay = true
    }

    if (action.type === "modalOverlayClick") {
        newState.overlay = false
        newState.sl_error = false
    }

    // =========================================================== User logged in/ou and error ms
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


    // =========================================================== Link folder state opened / closed
    if (action.type === "folder state") {
        // modifies the Store categories
        newState.categories[action.catId].state = action.catState
        // Set active category
        newState.activeCat = action.catId
    }

    // =========================================================== Link details display
    if (action.type === "link detail") {
        // Set active link
        newState.activeLink = action.linkId
        // Set active category
        newState.activeCat = action.catId

        // Turn the unsaved details window off (if displayed)
        newState.unsavedShown = false
    }

    // =========================================================== Link rating ( triggers a change to save )
    if (action.type === "change rating") {

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Link",
            index: action.activeLink,
            property: "rating",
            oldValue: newState.links[action.activeLink].rating,
            newValue: action.rating,
            time: new Date().getTime()
        })

        // Make the change
        newState.links[action.activeLink].rating = action.rating



    }

    // =========================================================== New folder ( triggers a change to save )
    if (action.type === "folder add") {


        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Folder",
            index: newState.categories.length,
            property: "ALL",
            oldValue: "",
            newValue: action.folderName,
            time: new Date().getTime()
        })

        // Make the change
        newState.categories.push({
            name: action.folderName,
            content: [],
            state: "closed"
        })

        // Close modal
        newState.overlay = false
        newState.sl_error = false

    }

    // =========================================================== New link ( triggers a change to save )
    if (action.type === "link add") {

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Link",
            index: newState.links.length,
            property: "ALL",
            oldValue: "",
            newValue: action.link.name,
            time: new Date().getTime()
        })

        // Make the change
        let linkIndex = newState.links.length
        console.log("linkIndex", linkIndex)
        newState.links.push(action.link)

        // Add the link index in the category
        newState.categories[action.cat].content.push(linkIndex)

        // Close the modal
        newState.overlay = false
        newState.sl_error = false
    }

    // =========================================================== Link edit Comment
    if (action.type === "link comment change") {

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Link",
            index: action.activelink,
            property: "comment",
            oldValue: newState.links[action.activelink].comment,
            newValue: action.quill_comment,
            time: new Date().getTime()
        })

        // Make the change
        newState.links[action.activelink].comment = action.quill_comment
    }

    // =========================================================== Link edit name ( triggers a change to save )

    // ...
    // ...
    // ...
    // ...
    // ...

    // =========================================================== Unsaved details show
    if (action.type === "display unsaved changes") {
        newState.unsavedShown = true
    }



    // =========================================================== SAVE CHANGES

    // ...
    // ...
    // ...
    // ...
    // ...

    // =========================================================== SHARE A FOLDER

    // ...
    // ...
    // ...
    // ...
    // ...

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