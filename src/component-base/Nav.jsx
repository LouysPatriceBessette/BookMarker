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
import Form_login from "./Form_login.jsx";
import Form_add_folder from "./Form_add_folder.jsx";
import Form_add_link from "./Form_add_link.jsx";

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

  // A way to have those 4 functions in a separate .js or .jsx file ???
  // see Nav-functions.jsx (failing...)
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
        title: "Add a folder",
        component: <Form_add_folder />
      }
    });
  };

  add_link = () => {
    this.props.dispatch({
      type: "modal",
      content: {
        title: "Add a link",
        component: <Form_add_link />
      }
    });
  };

  unsavedChanges_display = () => {
    log.ok("Display the unsaved changes list.");
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
            <FontAwesomeIcon
              icon="user-circle"
              className="navIcon login"
              title="Login"
              onClick={this.login}
            />
            <div className="searchDiv"></div>
            <div className="bookmarker">
              <h1>Bookmarker.Club</h1>
            </div>
            <div>
              <img className="logo" src="/book.png" />
            </div>
          </nav>
        </>
      ); // ==================================================================== End return

      // USED IS LOGGED
    } else {
      // For 200ms...
      let activeFolderName = "...";
      if (this.props.activeCat !== -1) {
        activeFolderName = this.props.categories[this.props.activeCat].name;
      }

      // The unsaved icon
      let cloud = () => {
        if (this.props.unsavedChanges) {
          return (
            <div id="cloud" title="You have changes to save!">
              <FontAwesomeIcon
                icon="cloud"
                className="navIcon save"
                onClick={this.unsavedChanges_display}
              />
            </div>
          );
        } else {
          return (
            <div id="cloud" title="All saved">
              <FontAwesomeIcon icon="cloud" className="navIcon save disabled" />
            </div>
          );
        }
      };

      // ======================================================================= Return
      return (
        <>
          <nav>
            <div className="order_selects">
              Results are{" "}
              <select>
                <option>alphabetical</option>

                <option defaultValue>chronological</option>
                <option>rating</option>
              </select>
              and
              <select>
                <option>ascending</option>
                <option defaultValue>descending</option>
              </select>
            </div>
            <div title={this.props.username}>
              <FontAwesomeIcon
                icon="user-circle"
                className="navIcon login logged"
                onClick={this.logout}
              />
            </div>

            {cloud()}

            <div title="Add a tab">
              <FontAwesomeIcon
                icon="folder"
                className="navIcon folderAdd"
                onClick={this.add_folder}
              />
            </div>
            <div title={"Add a link to " + activeFolderName}>
              <FontAwesomeIcon
                icon="link"
                className="navIcon linkAdd"
                onClick={this.add_link}
              />
            </div>
            <div className="searchDiv">
              <input
                type="text"
                className="searchInput"
                placeholder="Search your bookmarks..."
              />
              <FontAwesomeIcon
                icon="search"
                className="navIcon search"
                //onClick={this.search}
              />
            </div>
            <div className="bookmarker">
              <h1>Bookmarker.Club</h1>
            </div>
            <div>
              <img className="logo" src="/book.png" />
            </div>
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
