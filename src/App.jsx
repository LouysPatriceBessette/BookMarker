// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports
import Nav from "./component-base/Nav.jsx";
import Page from "./component-base/Page.jsx";
import Modal from "./component-base/Modal.jsx";

// Cookie check
import Cookies from "js-cookie";

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
} from "./js-lib/_js-setup.js";

// =============================================================================================================== Component class

class U_App extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  cookie = async () => {
    let sid_cookie = Cookies.get("sid");
    if (sid_cookie) {
      let response = await qf("/cookie", "post");

      if (response.success) {
        this.props.dispatch({ type: "logged", content: response });
      }
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("App");

    // Cookie check
    if (!this.props.logged) {
      this.cookie();
    }

    // ======================================================================= Return
    return (
      <>
        <Nav />
        <div className="page">
          <Page />
          <Modal />
        </div>
      </>
    ); // ==================================================================== End return
  };
}

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    logged: state.logged
  };
};

// =============================================================================================================== Component connection to the store
let App = connect(stp)(U_App);
export default App;
