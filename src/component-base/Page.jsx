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
import Home from "../component-publicView/Home.jsx";

// =============================================================================================================== Component class
class U_Page extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  // =============================================================================================================== Component render
  render = () => {
    log.render("Page");

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
    linkEdit: state.linkEdit
  };
};

// =============================================================================================================== Component connection to the store
let Page = connect(stp)(U_Page);
export default Page;
