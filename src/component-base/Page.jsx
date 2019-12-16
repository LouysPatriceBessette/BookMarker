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

import Unsaved from "../component/Unsaved.jsx";
import Tabbed_Categories from "../component/Tabbed_categories.jsx";
import Context from "../component-base/Context.jsx";
import Edit_Link from "../component/Edit_Link.jsx";
import Search_result from "../component/Search_result.jsx";
import Home from "../component-publicView/Home.jsx";

// =============================================================================================================== Component class
class U_Page extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  generiqueDeFin = () => {
    window.addEventListener("keyup", e => {
      if (e.ctrlKey && e.key == "q") {
        //alert("QUIT");
        console.clear();
        console.log("\n\n\n\n\n\n\n\n\n\n\n");
        console.log("This final university project was achieved on");
        console.log("             December 15, 2019");
        console.log("");
        console.log(
          "       %cDecodeMtl Concordia Bootcamp 'CB-I-2'",
          "font-weight:bold; color:red;"
        );
        console.log("               Montréal, Québec\n\n");
        console.log("=================================================");
        console.log("");
        console.log("   It will be online somewhere in January 2020");
        console.log("");
        console.log(
          "      Note down that URL: %cbookmarker.club",
          "font-weight:bold;"
        );
        console.log("");
        console.log("=================================================");
        console.log(
          "                     - %cLouys Patrice Bessette\n                        aka: Bes7weB\n\n\n\n\n\n",
          "font-weight:bold; color:blue;"
        );
        console.log(
          "                                      Copyright 2019~2020"
        );
      }
    });
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Page");

    this.generiqueDeFin();

    // User is logged
    if (this.props.logged) {
      // Categories / Unsaved / Link_edit views
      switch (true) {
        case this.props.unsavedShown:
          return (
            <>
              <div className="categoryDisplay">
                <Unsaved />
              </div>
            </>
          );
          break;
        case this.props.linkEdit:
          return (
            <>
              <div className="linkEdit_Display">
                <Edit_Link />
              </div>
            </>
          );
          break;
        case this.props.search_data.relevancy.length > 0:
          return (
            <>
              <div className="search_Display">
                <Search_result />
              </div>
            </>
          );
          break;
        default:
          return (
            <>
              <div className="tabs_container">
                <Tabbed_Categories />
                <Context />
              </div>
            </>
          );
      }
    }

    // User is NOT logged
    else {
      let pageClass = this.props.overlay ? "blurred" : "";

      // ======================================================================= Return
      return (
        <div className={pageClass}>
          <Home />
        </div>
      ); // ==================================================================== End return
    }
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    logged: state.logged,
    overlay: state.overlay,

    // to display unsaved changes list
    unsavedShown: state.unsavedShown,
    linkEdit: state.linkEdit,

    // Search results
    search_data: state.search_data
  };
};

// =============================================================================================================== Component connection to the store
let Page = connect(stp)(U_Page);
export default Page;
