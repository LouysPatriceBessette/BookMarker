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

// =============================================================================================================== Component class
class U_Search_result extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  // =============================================================================================================== Component render
  render = () => {
    if (this.props.search_data !== null) {
      log.render("Search_result");

      // quick test
      let names = this.props.search_data.search_string_hit.map(link => {
        return <h1>{link.name}</h1>;
      });

      // ======================================================================= Return
      return <>{names}</>; // ==================================================================== End return
    }

    // Not in search...
    else {
      return <></>;
    }
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    search_data: state.search_data
  };
};

// =============================================================================================================== Component connection to the store
let Search_result = connect(stp)(U_Search_result);
export default Search_result;
