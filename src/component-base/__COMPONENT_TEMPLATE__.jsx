// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports

// =============================================================================================================== Global functions
import {
  log,
  getRealType,
  map_O_spread,
  date_time,
  currency,
  rsg,
  qf,
  key
} from "../js-lib/_js-setup.js";

// =============================================================================================================== Component class
class U_COMPONENT_TEMPLATE extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  // =============================================================================================================== Component render
  render = () => {
    log.render("-- COMPONENT TEMPLATE --");

    // Render logic

    // ======================================================================= Return
    return (
      <>
        <div>...</div>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    //...
  };
};

// =============================================================================================================== Component connection to the store
let COMPONENT_TEMPLATE = connect(stp)(U_COMPONENT_TEMPLATE);
export default COMPONENT_TEMPLATE;
