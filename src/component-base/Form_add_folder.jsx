// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports

// =============================================================================================================== Global variables for the functions from the store
let currency, rsg, log, getRealType, map_O_spread, qf, date_time, key;

// =============================================================================================================== Component class
class U_Form_add_folder extends Component {
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

  add_cat_to_store = e => {
    e.preventDefault();

    let folderName = document.querySelector("#cat_name").value;
    if (folderName !== "") {
      this.props.dispatch({ type: "folder add", folderName: folderName });
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    this.setup();
    log.render("Form_add_folder");

    let errorClassName = "error";
    if (this.props.sl_error) {
      errorClassName += " shown";
    }

    // ======================================================================= Return
    return (
      <>
        <h1>{this.props.modal.title}</h1>
        <form>
          <p>
            Folder name: <input type="text" id="cat_name" />
            <input
              type="hidden"
              id="cat_index"
              value={this.props.categories.length}
            />
          </p>
          <p className={errorClassName}>{this.props.modal.title} failed...</p>
          <p>
            <button className="logBtn" onClick={this.add_cat_to_store}>
              Submit
            </button>
          </p>
        </form>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Functions from the state
    functions: state.functions,

    // Specific component props from the state here
    modal: state.modal,
    sl_error: state.sl_error,

    // Category index
    categories: state.categories
  };
};

// =============================================================================================================== Component connection to the store
let Form_add_folder = connect(stp)(U_Form_add_folder);
export default Form_add_folder;
