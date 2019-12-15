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

    this.state = {
      search_input: "",
      search_result_obj: null
    };
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
    this.props.dispatch({ type: "display unsaved changes" });
  };

  search = e => {
    let searchInput = e.target.value;

    if (searchInput === "") {
      log.error("No word to search!");
      return;
    }

    // Key words splitted
    let keywords = searchInput.split(" ");

    // Result array == Array of array of link items
    let search_string_hit = [];

    // RELEVANCY CHECK
    // 2 = both checks (title and comment)
    // 1 = one of the two
    let result_relevancy = [];

    // For all keyword, check all links for name and comment
    //
    // link.name ==== string
    // link.comment ==== array of objects... gotta look for property insert of each objects (may not exist??)
    //
    console.clear();
    keywords.forEach(word => {
      if (word !== "") {
        // Case insensitive search
        word = word.toLowerCase();

        log.ok("");
        log.var("word", word);
        log.ok("");

        let relevancy = []; // inner

        let search_word_hit = this.props.links.filter(link => {
          // filter boolean
          let returned_boolean = false;

          let catchedOnTitle = false;
          let catchedOnComment = false;

          // ====================================== Check link names
          // Case insensitive search
          let linkNameToLower = link.name.toLowerCase();
          //log.var("linkNameToLower", linkNameToLower);

          // If the word is found in the link name
          if (linkNameToLower.indexOf(word) !== -1) {
            returned_boolean = true;
            catchedOnTitle = true;
          }

          // ====================================== Check link comments

          link.comment.forEach(line => {
            // Case insensitive search
            let lineInsertToLower = line.insert.toLowerCase();
            //log.var("lineInsertToLower", lineInsertToLower);
            if (lineInsertToLower.indexOf(word) !== -1) {
              returned_boolean = true;
              catchedOnComment = true;
            }
          });

          if (returned_boolean) {
            log.var("====================== Catched link", link.name);
            log.var("catchedOnTitle", catchedOnTitle);
            log.var("catchedOnComment", catchedOnComment);
            // relevancy
            if (catchedOnTitle && !catchedOnComment) {
              relevancy.push(1);
            } else if (!catchedOnTitle && catchedOnComment) {
              relevancy.push(1);
            } else if (catchedOnTitle && catchedOnComment) {
              relevancy.push(2);
            }
            log.ok("");
          }

          return returned_boolean;
        }); // END filter links

        search_string_hit.push(search_word_hit);
        result_relevancy.push(relevancy);
      }
    });

    // Holds the filtered links
    log.var(
      "++++++++++++++++++++++++++ search_string_hit",
      search_string_hit.length
    );

    search_string_hit.forEach(word_hit => {
      word_hit.forEach(link => {
        log.var("catched link name", link.name);
      });
    });

    log.var(
      "++++++++++++++++++++++++++ Relevancy check",
      result_relevancy.length
    );

    result_relevancy.forEach(rel => {
      rel.forEach(note => {
        log.var("note", note);
      });
    });

    // REORDER BY RELEVANCY
    let ordered_relevancy = [];
    let ordered_search_string_hit = [];

    // Get the relevant score of 2
    result_relevancy[0].forEach((rel, i) => {
      if (rel === 2) {
        ordered_relevancy.push(rel);
        ordered_search_string_hit.push(search_string_hit[0][i]);
      }
    });

    // Get the relevant score of 1
    result_relevancy[0].forEach((rel, i) => {
      if (rel === 1) {
        ordered_relevancy.push(rel);
        ordered_search_string_hit.push(search_string_hit[0][i]);
      }
    });

    // Set state
    this.setState({
      search_input: e.target.value,
      search_result_obj: {
        result_relevancy: ordered_relevancy, //result_relevancy,
        search_string_hit: ordered_search_string_hit //search_string_hit
      }
    });
  };

  search_keyup = e => {
    if (e.key === "Enter") {
      log.ok("ENTER");

      this.props.dispatch({
        type: "search submit",
        data: this.state.search_result_obj
      });
    }
  };
  // =============================================================================================================== Component render
  render = () => {
    log.render("Nav");

    // If user is NOT logged in
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
                onChange={this.search}
                onKeyUp={this.search_keyup}
                value={this.state.search_input}
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
    unsavedChanges: state.unsavedChanges,

    // For the search function
    links: state.links
  };
};

// =============================================================================================================== Component connection to the store
let Nav = connect(stp)(U_Nav);
export default Nav;
