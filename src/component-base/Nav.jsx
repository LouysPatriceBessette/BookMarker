// =============================================================================================================== BATCH IMPORT
import {
  React,
  Component,
  connect,
  createStore,
  key,
  Cookies,
  Ratings,
  Quill,
  FontAwesomeIcon,
  library,
  fab,
  log,
  getRealType,
  map_O_spread,
  qf,
  date_time,
  currency,
  rsg
} from "../_BATCH-IMPORT.js";

// =============================================================================================================== Other component imports
import Form_login from "./Form_login.jsx";
import Form_add_folder from "./Form_add_folder.jsx";
import Form_add_link from "./Form_add_link.jsx";

// FontAwesome
import {
  faShoppingCart,
  faUserCircle,
  faSearch,
  faArrowUp
} from "@fortawesome/free-solid-svg-icons";

library.add(fab, faShoppingCart, faUserCircle, faSearch, faArrowUp);

// =============================================================================================================== Component class
class U_Nav extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

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

  logout = async () => {
    log.ok("Logging out.\n\n");
    let response = await qf("/logout", "post");

    if (response.success) {
      this.props.dispatch({ type: "logout" });
    }
  };

  // Add a new folder
  add_folder = () => {
    this.props.dispatch({
      type: "modal",
      content: {
        //fetchPath: "------------TBD--------------",
        title: "Add a folder",
        component: <Form_add_folder />
      }
    });
  };

  add_link = () => {
    this.props.dispatch({
      type: "modal",
      content: {
        //fetchPath: "------------TBD--------------",
        title: "Add a link",
        component: <Form_add_link />
      }
    });
  };

  unsavedChanges_display = () => {
    log.ok("Display the unsaved changes list.");

    // Changes are in the store
    // this.props.unsavedChanges_detail ==> array of objects

    // Got to display things for every objects in the PAGE
    this.props.dispatch({ type: "display unsaved changes" });
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Nav");

    // If user is NOT logged in
    log.var("logged?", this.props.logged);
    if (typeof this.props.logged !== "boolean") {
      log.error("Nav props.logged is a problem in Nav.jsx");
    }
    if (!this.props.logged) {
      // ======================================================================= Return
      return (
        <>
          <nav>
            <FontAwesomeIcon icon={faUserCircle} onClick={this.login} />
            <h1 className="homepage">BookMarker.Club</h1>
            <img className="logo" src="/book.png" />
          </nav>
        </>
      ); // ==================================================================== End return
    } else {
      // USED IS LOGGED

      // ===================================== function buttons

      // Add a link to a folder
      let add_a_link = (
        <button className="fctBtn" disabled title="Click a folder first">
          Add a link
        </button>
      );
      if (this.props.activeCat !== -1) {
        add_a_link = (
          <button className="fctBtn" onClick={this.add_link}>
            Add a link to {this.props.categories[this.props.activeCat].name}
          </button>
        );
      }

      // Save changes
      let save_changes = (
        <button className="fctBtn" disabled>
          No changes
        </button>
      );
      if (this.props.unsavedChanges) {
        save_changes = (
          <button
            className="fctBtn warning"
            onClick={this.unsavedChanges_display}
          >
            You have unsaved changes
          </button>
        );
      }

      // ======================================================================= Return
      return (
        <>
          <nav>
            <div>
              {save_changes}
              <button className="logBtn" onClick={this.logout}>
                Log out
              </button>
            </div>
            <div className="fctGroup">
              <button className="fctBtn" onClick={this.add_folder}>
                Add a folder
              </button>
              {add_a_link}
            </div>
            <div className="user">
              Logged as: <span>{this.props.username}</span>
            </div>
            <img className="logo" src="/book.png" />
          </nav>
        </>
      ); // ==================================================================== End return
    }
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    logged: state.logged,
    username: state.username,

    // For the function buttons
    categories: state.categories,
    activeCat: state.activeCat,
    activeLink: state.activeLink,
    unsavedChanges: state.unsavedChanges
  };
};

// =============================================================================================================== Component connection to the store
let Nav = connect(stp)(U_Nav);
export default Nav;
