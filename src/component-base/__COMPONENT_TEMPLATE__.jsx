// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports

// =============================================================================================================== Global variables for the functions from the store
let currency, rsg, log, getRealType, map_O_spread;

// =============================================================================================================== Component class
class U_COMPONENT_TEMPLATE extends Component {
  constructor(props) {
    super(props);
  }

  // Set function from the store
  setup = () => {
    currency = this.props.functions.currency;
    rsg = this.props.functions.rsg;
    log = this.props.functions.log;
    getRealType = this.props.functions.getRealType;
    map_O_spread = this.props.functions.map_O_spread;
  };
  // =============================================================================================================== Component functions

  // =============================================================================================================== Component render
  render = () => {
    this.setup();
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
    // Functions from the state
    functions: state.functions

    // Specific component props from the state here
    //...
  };
};

// =============================================================================================================== Component connection to the store
let COMPONENT_TEMPLATE = connect(stp)(U_COMPONENT_TEMPLATE);
export default COMPONENT_TEMPLATE;
