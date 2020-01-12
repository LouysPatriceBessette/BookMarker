// =============================================================================================================== BATCH IMPORT
import {
  React,
  Component,
  BrowserRouter,
  Route,
  Link,
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

// =============================================================================================================== Other component imports

// =============================================================================================================== Component class
class U_Form_login extends Component {
  constructor(props) {
    super(props);

    this.errorClassName = "error";
    this.errorHint = "error hintWhite";
  }

  // =============================================================================================================== Component functions
  fetchCredential = async e => {
    e.preventDefault();

    let errorHintClassName = <></>;

    let usernameVal = document.querySelector("#login_usr").value;
    let passwordVal = document.querySelector("#login_pwd").value;
    if (usernameVal !== "" && passwordVal !== "") {
      // Check if the username is valid
      // From https://emailregex.com/
      let emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
      let validEmail = usernameVal.match(emailRegex);

      // Check if the password strength is ok
      // From https://stackoverflow.com/a/5142164/2159528
      let passwordRegex = /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$/;
      let validPassword = passwordVal.match(passwordRegex);
      log.var("validPassword", validPassword);

      if (validEmail && validPassword) {
        log.var("validEmail", validEmail[0]);

        let Credential = new FormData();
        Credential.append("username", validEmail[0]);
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
        return;
      } // END if valid

      // Error hints on sign up
      if (this.props.modal.title === "Sign up") {
        // Email
        if (!validEmail) {
          log.error("invalid email adress.");

          // Set hint message
          errorHintClassName = (
            <>
              <p>Your email address looks wrong.</p>
            </>
          );
          this.props.dispatch({
            type: "sign-log-error",
            hint: errorHintClassName
          });
          return;
        }

        // Password
        if (!validPassword) {
          log.error("invalid password.");

          // Set hint message
          errorHintClassName = (
            <>
              <p>Your password must at least contain:</p>
              <ul>
                <li>Two (2) uppercase letters.</li>
                <li>Three (3) lowercase letters.</li>
                <li>One (1) special case letter.</li>
                <li>Two (2) digits.</li>
                <li>Eigth (8) characters in length.</li>
              </ul>
            </>
          );
          this.props.dispatch({
            type: "sign-log-error",
            hint: errorHintClassName
          });
          return;
        }
      } // END error hints on Sign up
    }
  };

  pwKeydown = e => {
    let errorMsgs = document.querySelectorAll(".error.shown");
    if (errorMsgs && e.type === "keydown") {
      errorMsgs.forEach(msg => {
        msg.classList.remove("shown");
      });
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
    log.render("Form_login");

    //let errorClassName = "error";
    if (this.props.sl_error) {
      this.errorClassName += " shown";
      log.ok("error shown");
    }

    //let errorHint = "error hintWhite";
    if (this.props.sl_error_hint) {
      this.errorHint += " shown";
      log.ok("error shown");
    }

    // ======================================================================= Return
    return (
      <>
        <h1>{this.props.modal.title}</h1>
        <form>
          <p className="sl_field_title">Email:</p>
          <p className="sl_field_input">
            <input type="text" id="login_usr" onKeyDown={this.pwKeydown} />
          </p>
          <p className="sl_field_title">Password:</p>
          <p className="sl_field_input">
            <input type="password" id="login_pwd" onKeyDown={this.pwKeydown} />
          </p>
          <p className={this.errorClassName}>
            {this.props.modal.title} failed...
          </p>
          <div className={this.errorClassName}>
            <div className={this.errorHint}>{this.props.sl_error_hint}</div>
          </div>
          <p>
            <button className="logBtn sl_submit" onClick={this.fetchCredential}>
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
    // Specific component props from the state here
    modal: state.modal,
    sl_error: state.sl_error,
    sl_error_hint: state.sl_error_hint
  };
};

// =============================================================================================================== Component connection to the store
let Form_login = connect(stp)(U_Form_login);
export default Form_login;
