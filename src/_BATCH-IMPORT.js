// ================================================= NPM IMPORTS

// REACT
import React, {
    Component
} from "react";

// REDUX
import {
    connect
} from "react-redux";

// STORE
import {
    createStore
} from "redux"

// JSX unique key
import key from 'weak-key'

// Cookies
import Cookies from "js-cookie";

// Rating
import Ratings from "react-ratings-declarative";

// Quill wysiwyg editor
import Quill from "quill";

// Responsive tabs
import Sortable from "react-sortablejs";

// Fucking UNINTUITIVE npm instal instructions: https://www.npmjs.com/package/@fortawesome/react-fontawesome#usage
// icon list: https://fontawesome.com/v4.7.0/icons/
import {
    FontAwesomeIcon
} from "@fortawesome/react-fontawesome";

// Image crop
import ReactCrop from 'react-image-crop';

// ================================================= CUSTOM JS

// Custom log
import log from './js-lib/custom_log.js'

// Real type of variables the Map_O_spread Deep copy
import {
    getRealType,
    map_O_spread
} from './js-lib/map_O_spread.js'

// Quick fetch
import qf from './js-lib/qf.js'

// Date and Time formating
import date_time from "./js-lib/date_time_format.js"

// Currency formating
import currency from './js-lib/currency_format.js'

// Random String
import rsg from './js-lib/random_string_gen.js'



// ================================================= EXPORT
export {
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
    ReactCrop,
    log,
    getRealType,
    map_O_spread,
    qf,
    date_time,
    currency,
    rsg
}