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
class U_Form_add_folder extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  add_cat_to_store = e => {
    e.preventDefault();

    let folderName = document.querySelector("#cat_name").value;
    if (folderName !== "") {
      this.props.dispatch({ type: "folder add", folderName: folderName });
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Form_add_folder");

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
            Folder name: <input type="text" id="cat_name" />
            <input
              type="hidden"
              id="cat_index"
              value={this.props.categories.length}
            />
          </p>
          <p className={errorClassName}>{this.props.modal.title} failed...</p>
          <p>
            <button className="logBtn" onClick={this.add_cat_to_store}>
              Submit
            </button>
          </p>
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

    // Category index
    categories: state.categories
  };
};

// =============================================================================================================== Component connection to the store
let Form_add_folder = connect(stp)(U_Form_add_folder);
export default Form_add_folder;
