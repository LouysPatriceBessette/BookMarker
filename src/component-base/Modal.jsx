// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports

// =============================================================================================================== Global variables for the functions from the store
let currency, rsg, log, getRealType, map_O_spread, qf, date_time, key;

// =============================================================================================================== Component class
class U_Modal extends Component {
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
    qf = this.props.functions.qf;
    date_time = this.props.functions.date_time;
    key = this.props.functions.key;
  };
  // =============================================================================================================== Component functions

  modalClick = e => {
    if (e.target.className === "modal_overlay") {
      this.props.dispatch({ type: "modalOverlayClick" });
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    this.setup();
    log.render("Modal");

    // If the modal is opened
    switch (true) {
      // If trying to log in
      case this.props.overlay:
        // ======================================================================= Return
        return (
          <>
            <div className="modal_overlay" onClick={this.modalClick}>
              <div className="modal">{this.props.modal.component}</div>
            </div>
            >
          </>
        ); // ==================================================================== End return

      default:
        // ======================================================================= Return
        return <></>; // ==================================================================== End return
    } // End switch
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Functions from the state
    functions: state.functions,

    // Specific component props from the state here
    overlay: state.overlay,
    modal: state.modal
  };
};

// =============================================================================================================== Component connection to the store
let Modal = connect(stp)(U_Modal);
export default Modal;
