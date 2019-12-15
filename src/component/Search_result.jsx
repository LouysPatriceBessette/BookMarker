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
import Tabbed_Links from "./Tabbed_links.jsx";
import Tabbed_Thumbs from "./Tabbed_Thumbs.jsx";

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
      let link_cards = this.props.search_data.link_indexes.map(cc => {
        if (this.props.fullCards) {
          return <Tabbed_Links key={key({ thisCard: cc })} activeLink={cc} />;
        } else {
          return <Tabbed_Thumbs key={key({ thisCard: cc })} activeLink={cc} />;
        }
      });

      let header_plural =
        this.props.search_data.link_indexes.length > 1 ? "s" : "";

      // ======================================================================= Return
      return (
        <>
          <div className="search_header">
            <h1>
              {this.props.search_data.link_indexes.length} result{header_plural}
            </h1>
          </div>
          <div className="search_results">{link_cards}</div>
        </>
      ); // ==================================================================== End return
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
    search_data: state.search_data,

    // For the thumb/full view
    fullCards: state.fullCards
  };
};

// =============================================================================================================== Component connection to the store
let Search_result = connect(stp)(U_Search_result);
export default Search_result;
