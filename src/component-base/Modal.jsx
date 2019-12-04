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
class U_Modal extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  modalClick = e => {
    if (e.target.className === "modal_overlay") {
      this.props.dispatch({ type: "modalOverlayClick" });
    }
  };

  // =============================================================================================================== Component render
  render = () => {
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
    // Specific component props from the state here
    overlay: state.overlay,
    modal: state.modal
  };
};

// =============================================================================================================== Component connection to the store
let Modal = connect(stp)(U_Modal);
export default Modal;
