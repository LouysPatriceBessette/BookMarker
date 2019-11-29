import React, { Component } from "react";
import Nav from "./component-base/Nav.jsx";
import Page from "./component-base/Page.jsx";
import Modal from "./component-base/Modal.jsx";

// Cookie check
import Cookies from "js-cookie";

class App extends Component {
  render = () => {
    return (
      <>
        <Nav />
        <div className="page">
          <Page />
          <Modal />
        </div>
      </>
    );
  };
}

export default App;
