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
} from "../_BATCH-IMPORT.js";

import Form_add_folder from "./Form_add_folder.jsx";
import Form_add_link from "./Form_add_link.jsx";

let logout = async () => {
  log.ok("Logging out.\n\n");
  let response = await qf("/logout", "post");

  if (response.success) {
    this.props.dispatch({
      type: "logout"
    });
  }
};

// Add a new folder
let add_folder = () => {
  this.props.dispatch({
    type: "modal",
    content: {
      title: "Add a folder",
      component: <Form_add_folder />
    }
  });
};

let add_link = () => {
  this.props.dispatch({
    type: "modal",
    content: {
      title: "Add a link",
      component: <Form_add_link />
    }
  });
};

let unsavedChanges_display = () => {
  this.props.dispatch({
    type: "display unsaved changes"
  });
};

export { logout, add_folder, add_link, unsavedChanges_display };
