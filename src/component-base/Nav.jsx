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

    // Variables used to capture keyword hits on change
    this.result_search_hit = [];

    // RELEVANCY CHECK
    // 2 = both checks (title and comment)
    // 1 = one of the two
    this.result_relevancy = [];

    // Original indexes array of array...
    this.result_original_link_indexes = [];

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
    // Clear the console because it is hallucinating...
    console.clear();

    let searchInput = e.target.value.trim();

    let group = "";
    let searchInput_begin = "";
    let searchInput_end = "";

    // Word grouping option!!
    if (searchInput.indexOf('"') !== -1) {
      log.ok("GROUPING!");

      // Check if there is two "" else return... Wait for the second one.
      let searchInput_characters = searchInput.split("");
      let quotes_position = [];
      searchInput_characters.forEach((character, characterIndex) => {
        if (character === '"') {
          log.var("catch", characterIndex);
          quotes_position.push(characterIndex);
        }
      });

      log.var("quotes_position", quotes_position);

      if (quotes_position.length === 2) {
        log.ok("We have a group!");

        // Modify searchInput!
        group = searchInput_characters
          .slice(quotes_position[0] + 1, quotes_position[1])
          .join("");
        log.var("group", group);

        // CHANGE the keywords array (defined later!!)
        searchInput_begin = searchInput_characters
          .slice(0, quotes_position[0])
          .join("")
          .trim();
        searchInput_end = searchInput_characters
          .slice(quotes_position[1] + 1)
          .join("")
          .trim();
      } else {
        // Don't process the keywords befor the second quotes is there
        this.setState({
          // Used to keep the search input up to date
          search_input: e.target.value,

          // UPDATE search_result_obj with empty... lol
          search_result_obj: {
            relevancy: [], // relevancy note: 1 or 2... ,
            search_hit: [], // search_hit
            link_indexes: [] // Original link indexes
          }
        });

        return;
      }
    }

    // Key words splitted
    let keywords = [];

    // Keyword using the "group search"
    if (group !== "") {
      log.error("keywords using the group");
      log.var("group again", group);
      if (searchInput_begin !== "") {
        keywords = keywords.concat(searchInput_begin.split(" "));
      }
      keywords = keywords.concat([group]);
      if (searchInput_end !== "") {
        keywords = keywords.concat(searchInput_end.split(" "));
      }

      log.var("keywords=====", keywords);
    }

    // "normal word splitting
    else {
      log.error("normal keywords");
      keywords = searchInput.split(" ");
    }

    // clean the "global" variables if there is nothing in the searcch field
    log.var("keywords.length", keywords.length);
    log.var("keywords", keywords);

    if (keywords.length === 1 && keywords[0] === "") {
      log.ok("Cleaned...");
      this.result_search_hit = [];
      this.result_relevancy = [];
      this.result_original_link_indexes = [];
    } else {
      this.result_search_hit = this.result_search_hit.slice(0, keywords.length);
      this.result_relevancy = this.result_relevancy.slice(0, keywords.length);
      this.result_original_link_indexes = this.result_original_link_indexes.slice(
        0,
        keywords.length
      );
    }

    // then make sure the unrelevant hits are removed

    // For all keyword, check all links for name and comment
    //
    // link.name ==== string
    // link.comment ==== array of objects... gotta look for property insert of each objects (may not exist??)
    //

    keywords.forEach((word, word_index) => {
      if (word !== "") {
        // Case insensitive search
        word = word.toLowerCase();

        log.ok("");
        log.var("word", word);
        log.ok("");

        let relevancy = [];
        let original_link_index = [];

        let search_word_hit = this.props.links.filter((link, link_index) => {
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

            // catch the original index of the link in the links array
            original_link_index.push(link_index);
          }

          return returned_boolean;
        }); // END filter links

        // Fill the arrays on "global scope" (scope out of the forEach word) Haaa... We're restting that on keyup...
        this.result_search_hit[word_index] = search_word_hit;
        this.result_relevancy[word_index] = relevancy;
        this.result_original_link_indexes[word_index] = original_link_index;
      }
    }); // END forEach word

    // Holds the filtered links
    log.var(
      "++++++++++++++++++++++++++ this.result_search_hit",
      this.result_search_hit.length
    );

    this.result_search_hit.forEach(word_hit => {
      word_hit.forEach(link => {
        log.var("catched link name", link.name);
      });
    });

    log.var(
      "++++++++++++++++++++++++++ Relevancy check",
      this.result_relevancy.length
    );

    this.result_relevancy.forEach(rel => {
      rel.forEach(note => {
        log.var("note", note);
      });
    });

    // REORDER BY RELEVANCY
    let ordered_relevancy = [];
    let ordered_search_hit = [];
    let ordered_link_indexes = [];

    let caught_indexes = {};

    if (this.result_relevancy.length > 0) {
      // Get the relevant score of 2
      this.result_relevancy.forEach((wordHit, wi) => {
        wordHit.forEach((rel, i) => {
          if (rel === 2) {
            // Prevent catching the same link index more than once
            if (!caught_indexes[this.result_original_link_indexes[wi][i]]) {
              ordered_relevancy.push(rel);
              ordered_search_hit.push(this.result_search_hit[wi][i]);
              ordered_link_indexes.push(
                this.result_original_link_indexes[wi][i]
              );

              // link index caught!
              caught_indexes[this.result_original_link_indexes[wi][i]] = true;
            }
          }
        });
      });

      // Get the relevant score of 1
      this.result_relevancy.forEach((wordHit, wi) => {
        wordHit.forEach((rel, i) => {
          if (rel === 1) {
            // Prevent catching the same link index more than once
            if (!caught_indexes[this.result_original_link_indexes[wi][i]]) {
              ordered_relevancy.push(rel);
              ordered_search_hit.push(this.result_search_hit[wi][i]);
              ordered_link_indexes.push(
                this.result_original_link_indexes[wi][i]
              );

              // link index caught!
              caught_indexes[this.result_original_link_indexes[wi][i]] = true;
            }
          }
        });
      });
    }

    log.var("ordered_link_indexes", ordered_link_indexes);

    // Set state
    this.setState({
      // Used to keep the search input up to date
      search_input: e.target.value,

      // "Global" variables

      // That object is dispacthed to the store.
      // Sending EVERY result details... But in fact, only the link_indexes is used by search_result component.
      search_result_obj: {
        relevancy: ordered_relevancy, // relevancy note: 1 or 2... ,
        search_hit: ordered_search_hit, // search_hit
        link_indexes: ordered_link_indexes // Original link indexes
      }
    });
  }; // END search function (on change event)

  search_keyup = e => {
    // Dispatch to the store to enable/disable the search_result component
    this.props.dispatch({
      type: "search submit",
      data: this.state.search_result_obj
    });
    //}
  };

  thumbView_checked = () => {
    if (this.props.fullCards) {
      return {
        full: true,
        thumb: false
      };
    } else {
      return {
        full: false,
        thumb: true
      };
    }
  };

  thumbView_change = e => {
    log.ok("thumbView change");
    log.var("e.target.value", e.target.value);

    let fullCards = e.target.value === "full";

    //document.Cookies
    this.props.dispatch({ type: "thumbView change", fullCards: fullCards });
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
            <div className="thumbView_select">
              <div>
                <input
                  type="radio"
                  name="thumbView"
                  value="full"
                  id="full"
                  defaultChecked={this.thumbView_checked().full}
                  onClick={this.thumbView_change}
                />
                <label htmlFor="full">Full cards</label>
              </div>
              <div>
                <input
                  type="radio"
                  name="thumbView"
                  value="thumb"
                  id="thumb"
                  defaultChecked={this.thumbView_checked().thumb}
                  onClick={this.thumbView_change}
                />
                <label htmlFor="thumb">Thumbs</label>
              </div>
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
    links: state.links,

    // For the thumb/full view
    fullCards: state.fullCards
  };
};

// =============================================================================================================== Component connection to the store
let Nav = connect(stp)(U_Nav);
export default Nav;
