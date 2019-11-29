import React, { Component } from "react";
import { connect } from "react-redux";

// Global variables for the functions from the store
let currency;
let rsg;
let log;
let getRealType;
let map_O_spread;

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
  };
  // ================================================================================= Component functions

  modalClick = e => {
    if (e.target.className === "modal_overlay") {
      this.props.dispatch({ type: "modalOverlayClick" });
    }
  };

  fetchCredential = e => {
    e.preventDefault();

    let usernameVal = document.querySelector("#login_usr").value;
    let passwordVal = document.querySelector("#login_pwd").value;
    if (usernameVal !== "" && passwordVal !== "") {
      let Credential = new FormData();
      Credential.append("username", usernameVal);
      Credential.append("password", passwordVal);

      fetch("/" + this.props.modal.fetchPath, {
        method: "post",
        body: Credential
      })
        .then(res => {
          return res.text();
        })
        .then(text => {
          log.var("fetch response", text);
          let o_text = JSON.parse(text);
          if (o_text.success) {
            this.props.dispatch({ type: "logged", content: o_text });
          } else {
            this.props.dispatch({ type: "sign-log-error" });
            document.querySelector("[type='password']").value = "";
          }
        });
    }
  };

  render = () => {
    this.setup();
    log.render("Modal");

    let errorClassName = "error";
    if (this.props.sl_error) {
      errorClassName += " shown";
    }
    // If trying to log in
    switch (true) {
      // If trying to log in
      case this.props.overlay:
        return (
          <>
            <div className="modal_overlay" onClick={this.modalClick}>
              <div className="modal">
                <h1>{this.props.modal.title}</h1>
                <form>
                  <p>
                    Username: <input type="text" id="login_usr" />
                  </p>
                  <p>
                    password: <input type="password" id="login_pwd" />
                  </p>
                  <p className={errorClassName}>
                    {this.props.modal.title} failed...
                  </p>
                  <p>
                    <button className="logBtn" onClick={this.fetchCredential}>
                      Submit
                    </button>
                  </p>
                </form>
              </div>
            </div>
            >
          </>
        );

      default:
        return <></>;
    } // End switch
  }; // End render
} // End class

// ===================================================================== Component connect
let stp = state => {
  return {
    functions: state.functions,
    sl_error: state.sl_error,
    overlay: state.overlay,
    modal: state.modal
  };
};
let Modal = connect(stp)(U_Modal);

export default Modal;
