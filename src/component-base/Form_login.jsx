// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports

// =============================================================================================================== Global variables for the functions from the store
let currency, rsg, log, getRealType, map_O_spread, qf, key;

// =============================================================================================================== Component class
class U_Form_login extends Component {
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
    key = this.props.functions.key;
  };

  // =============================================================================================================== Component functions
  fetchCredential = async e => {
    e.preventDefault();

    let usernameVal = document.querySelector("#login_usr").value;
    let passwordVal = document.querySelector("#login_pwd").value;
    if (usernameVal !== "" && passwordVal !== "") {
      let Credential = new FormData();
      Credential.append("username", usernameVal);
      Credential.append("password", passwordVal);

      let response = await qf(
        "/" + this.props.modal.fetchPath,
        "post",
        Credential
      );

      if (response.success) {
        this.props.dispatch({ type: "logged", content: response });
      } else {
        this.props.dispatch({ type: "sign-log-error" });
        document.querySelector("[type='password']").value = "";
      }
    }
  };

  signupLink = () => {
    if (this.props.modal.title === "Log in") {
      return (
        <a className="NavLink" onClick={this.signup}>
          Create an account?
        </a>
      );
    }
    if (this.props.modal.title === "Sign up") {
      return (
        <a className="NavLink" onClick={this.login}>
          I already have an account.
        </a>
      );
    }
  };

  signup = e => {
    log.ok("Signing up.\n\n");
    this.props.dispatch({
      type: "modal",
      content: {
        fetchPath: "signup",
        title: "Sign up",
        component: <Form_login />
      }
    });
  };

  login = () => {
    log.ok("Logging in.\n\n");
    this.props.dispatch({
      type: "modal",
      content: {
        fetchPath: "login",
        title: "Log in",
        component: <Form_login />
      }
    });
  };

  // =============================================================================================================== Component render
  render = () => {
    this.setup();
    log.render("-- COMPONENT TEMPLATE --");

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
            Username: <input type="text" id="login_usr" />
          </p>
          <p>
            password: <input type="password" id="login_pwd" />
          </p>
          <p className={errorClassName}>{this.props.modal.title} failed...</p>
          <p>
            <button className="logBtn" onClick={this.fetchCredential}>
              Submit
            </button>
          </p>
          <div className="alignRight">{this.signupLink()}</div>
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
    sl_error: state.sl_error
  };
};

// =============================================================================================================== Component connection to the store
let Form_login = connect(stp)(U_Form_login);
export default Form_login;