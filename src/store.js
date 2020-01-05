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

// Function to return the view thumnails or full cards view (boolean)
let view_cookie = () => {
    let cookieValue_string = Cookies.get("fullCards")

    if (cookieValue_string === undefined) {
        console.log("in view_cookie, UNDEFINED")
        return "full"
    } else {
        console.log("in view_cookie, cookie value is", cookieValue_string)
        return cookieValue_string
    }
}

let defaultStore = {

    // Application variables NOT LOGGED
    logged: false,
    activeCat: -1,
    activeLink: -1,
    unsavedChanges: false,
    unsavedChanges_detail: [],
    unsavedShown: false,

    linkEdit: false,
    image_underlay: true,
    image_edited: false,
    image_accepted: false,

    search_data: {
        relevancy: [],
        search_string_result: [],
        link_indexes: []
    },

    fullCards: view_cookie()
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
        newState.history = action.content.user.history
    }

    if (action.type === "logout") {
        newState = defaultStore
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

    if ((action.type === "tab change while dragging")) {
        //newState.activeCat = action.activeCat
        newState.dragging = action.dragging
        newState.dragged_card = action.dragged_card
        newState.dragged_card_id = action.dragged_card_id
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

        newState.linkEdit = true
        newState.activeLink = newState.links.length
        newState.activeCat = action.cat

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Link",
            index: newState.links.length,
            property: "ALL",
            // oldValue: "",
            newValue: action.link.name,
            time: new Date().getTime()
        })

        // Add the default image to the new link...
        action.link["image"] = "/image_missing.png"

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

    // =========================================================== New link ( triggers a change to save )
    if (action.type === "link add from wildcard") {

        newState.linkEdit = true
        newState.activeLink = newState.links.length
        newState.activeCat = action.cat

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

        // Add the default image to the new link...
        action.link["image"] = "/image_missing.png"

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

    // =========================================================== Link edit display ( triggers a change to save )

    if (action.type === "link edit display") {
        newState.linkEdit = true
        newState.activeLink = action.linkId
    }

    if (action.type === "link edit image updated") {

        // Turn the image edited flag on
        newState.image_edited = true

        // Close modal
        newState.overlay = false
        newState.sl_error = false

        // Remove image underlay
        newState.image_underlay = false
    }

    if (action.type === "Accept an image") {

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Link",
            index: newState.activeLink,
            property: "image",
            //oldValue: newState.image,
            newValue: action.imageID,
            time: new Date().getTime()
        })

        newState.image_accepted = true
        newState.links[action.activeLink].image = action.base64_img
        newState.links[action.activeLink].imageID = action.imageID
    }

    if (action.type === "quit link edit") {
        // Reset store
        newState.linkEdit = false
        newState.image_underlay = true
        newState.image_edited = false
        newState.image_accepted = false
    }

    if (action.type === "DELETE link") {

        // Flag.
        newState.unsavedChanges = true

        // Store the unsaved change details
        newState.unsavedChanges_detail.push({

            target: "Link",
            index: newState.activeLink,
            property: "DELETED",
            time: new Date().getTime()
        })

        newState.linkEdit = false
        newState.image_underlay = true
        // newState.image_edited = false
        // newState.image_accepted = false
        newState.links[newState.activeLink].deleted = true
        newState.categories[newState.activeCat].content = newState.categories[newState.activeCat].content.filter(item => {
            return item !== newState.activeLink
        })
    }

    // =========================================================== Link edit Comment ( triggers a change to save )
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

    // =========================================================== SEARCH

    if (action.type === "search submit") {
        // search_result_obj
        newState.search_data = action.data
    }

    // =========================================================== THUMBNAIL VIEW

    if (action.type === "thumbView change") {

        newState.fullCards = action.fullCards
        Cookies.set('fullCards', action.fullCards)
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