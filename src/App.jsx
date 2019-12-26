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
} from "./_BATCH-IMPORT.js";

// =============================================================================================================== Other component imports
import Nav from "./component-base/Nav.jsx";
import Page from "./component-base/Page.jsx";
import Modal from "./component-base/Modal.jsx";

// ====================================================================================== FontAwesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";

// FontAwesome
import {
  faUserCircle,
  faSearch,
  faEdit /* Pas sur de l'aimer... */,
  faCloud,
  faFolder,
  faLink,
  faCheck,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

library.add(
  fab,
  faUserCircle,
  faSearch,
  faEdit,
  faCloud,
  faFolder,
  faLink,
  faCheck,
  faTimes
);

// =============================================================================================================== Component class

class U_App extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  cookie = async () => {
    let sid_cookie = Cookies.get("sid");
    if (sid_cookie) {
      let response = await qf("/cookie", "post");

      if (response.success) {
        this.props.dispatch({ type: "logged", content: response });
      }
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("App");

    // Cookie check
    if (!this.props.logged) {
      this.cookie();
    }

    // ======================================================================= Return
    return (
      <>
        <BrowserRouter>
          <Nav />
          <div className="page">
            <Page />
            <Modal />
          </div>
        </BrowserRouter>
      </>
    ); // ==================================================================== End return
  };
}

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    logged: state.logged
  };
};

// =============================================================================================================== Component connection to the store
let App = connect(stp)(U_App);
export default App;
