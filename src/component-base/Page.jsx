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
// =============================================================================================================== Component class
class U_Page extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  // =============================================================================================================== Component render
  render = () => {
    log.render("Page");

    // Categories listing
    if (this.props.logged) {
      if (this.props.unsavedShown) {
        // ======================================================================= Return
        return (
          <>
            {/* <div className="categoryTree">
              <Categories />
            </div> */}
            <div className="categoryDisplay">
              <Unsaved />
            </div>
          </>
        ); // ==================================================================== End return
      } else {
        // ======================================================================= Return
        return (
          <>
            <div className="tabs_container">
              <Tabbed_Categories />
            </div>
          </>
        ); // ==================================================================== End return
      }
    } else {
      let pageClass = this.props.overlay ? "blurred" : "";

      // ======================================================================= Return
      return (
        <div className={pageClass}>
          <div>
            <h1>Access your bookmarks from anywhere!</h1>
          </div>
          <div>
            <p>
              This website allows you to store your favorite web links in a new
              parctical way.
            </p>
          </div>

          <div>
            <h2>Share them!</h2>
          </div>
          <div>
            <p>
              This website allows you to store your favorite web links in a new
              practical way.
            </p>
            <p>
              You can have all your links classified as you want and you can
              share them with your friends.
            </p>
            <p>
              <b>Features:</b>
            </p>
            <ul>
              <li>Category sharing</li>
              <li>Drag and drop classification</li>
              <li>Easy edit</li>
              <li>Easy search</li>
              <li>Comments</li>
              <li>Automatic check for broken links</li>
            </ul>
          </div>

          <div>
            <h2>One month free trial.</h2>
          </div>
          <div>
            <p>
              After a month, if you like the service and want to continue using
              it, you will be asked to upgrade to a paid account. That is to
              help us maintain and improve the site.
            </p>
          </div>

          <div>
            <h6>===============</h6>
          </div>
          <div>
            <p className="legal">* {rsg(3)}</p>
          </div>
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
    unsavedShown: state.unsavedShown
  };
};

// =============================================================================================================== Component connection to the store
let Page = connect(stp)(U_Page);
export default Page;
