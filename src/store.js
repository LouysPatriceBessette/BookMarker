// =============================================================================================================== BATCH IMPORT
import {
    React,
    Component,
    connect,
    createStore,
    key,
    Cookies,
    Ratings,
    Quill,
    Sortable,
    FontAwesomeIcon,
    log,
    getRealType,
    map_O_spread,
    qf,
    date_time,
    currency,
    rsg
} from "./_BATCH-IMPORT.js"

// =============================================================================================================== Default store
let defaultStore = {

    // Application variables NOT LOGGED
    logged: false,
    activeCat: -1,
    unsavedChanges: false,
    unsavedChanges_detail: [],
    unsavedShown: false,
}

let reducer = (state, action) => {

    // State deep copy
    let newState = map_O_spread(state)

    // =========================================================================================================== Action dispatchers

    // =========================================================== Modal
    if (action.type === "modal") {
        newState.modal = action.content
        newState.overlay = true
    }

    if (action.type === "modalOverlayClick") {
        newState.overlay = false
        newState.sl_error = false
    }

    // =========================================================== User logged in/out and error msg
    if (action.type === "logged") {
        newState.logged = true
        newState.username = action.content.user.username
        newState.overlay = false
        newState.categories = action.content.user.categories
        newState.links = action.content.user.links
        newState.bank_id = action.content.user.userBank_id
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

    if ((action.type === "tab change")) {
        newState.activeCat = action.activeCat
    }

    // =========================================================== New folder ( triggers a change to save )
    if (action.type === "folder add") {

        let catID = newState.categories.length
        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Folder",
            index: catID,
            property: "ALL",
            oldValue: "",
            newValue: action.folderName,
            time: new Date().getTime()
        })

        // ================================================ Make the change

        // ADD 1 to ALL category order property
        newState.categories = newState.categories.map(cat => {
            cat.order = cat.order + 1
            return cat
        })

        // push the new category at the end.
        newState.categories.push({
            name: action.folderName,
            content: [],
            state: "closed",
            order: 0, // on TOP of all categories render order!
        })

        // Set the tab active
        newState.activeCat = catID

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

    if (action.type === "link name change") {

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Link",
            index: action.activelink,
            property: "name",
            oldValue: newState.links[action.activelink].name,
            newValue: action.newName,
            time: new Date().getTime()
        })

        // Make the change
        newState.links[action.activelink].name = action.newName
    }

    // =========================================================== Category edit name ( triggers a change to save )

    if (action.type === "category name change") {

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Folder",
            index: action.activeCat,
            property: "name",
            oldValue: newState.categories[action.activeCat].name,
            newValue: action.newName,
            time: new Date().getTime()
        })

        // Make the change
        newState.categories[action.activeCat].name = action.newName
    }

    // =========================================================== Category re-order ( triggers a change to save )

    if (action.type === "category order change") {

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Folder",
            //index: action.activeCat,
            property: "order",
            oldValue: action.previousOrder,
            newValue: action.newOrder,
            time: new Date().getTime()
        })

        // Make the change
        let newCategories = map_O_spread(newState.categories)
        newState.categories.forEach((c, i) => {
            newCategories[i].order = action.newOrder[i]
        })
        newState.categories = newCategories

    }

    // =========================================================== Links order change ( triggers a change to save )
    if (action.type === "links order change") {

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Links",
            property: "order",
            category_affected: action.category_id,
            categoryName: action.categoryName,
            oldValue: action.previousOrder,
            newValue: action.newOrder,
            time: new Date().getTime()
        })

        // Make the change for the affected category
        newState.categories[action.category_id].content = action.newOrder

    }

    // =========================================================== Unsaved details show / hide
    if (action.type === "display unsaved changes") {
        newState.unsavedShown = true
    }

    if (action.type === "quit unsaved changes") {
        newState.unsavedShown = false
    }

    // =========================================================== CHANGES SAVED!

    if (action.type === "changes saved") {
        newState.unsavedShown = false
        newState.unsavedChanges_detail = []
        newState.unsavedChanges = false
    }

    // =========================================================== SHARE A FOLDER

    // ...

    // ========================================================================================= RETURN STATE
    return newState
}

// =============================================================================================================== STORE CREATION
const store = createStore(
    reducer,
    defaultStore,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
log.ok("Redux store created.")
export default store