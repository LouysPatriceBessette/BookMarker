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

import Tabs from "react-responsive-tabs";
import "react-responsive-tabs/styles.css";

import Tabbed_Links from "./Tabbed_links.jsx";

// =============================================================================================================== Component class
class U_Tabbed_Categories extends Component {
  constructor(props) {
    super(props);

    this.render_order = [];

    this.state = {
      category_rename: ""
    };
  }

  // =============================================================================================================== Component functions

  // produces the array of only the order each category should be in.
  get_order = () => {
    return this.props.categories.map(c => {
      return c.order;
    });
  };

  reorder = () => {
    // Variable used to reorder the categories
    let categories_length = this.props.categories.length;
    let category_processed = 0;

    let ordered_categories = [];
    let original_indexes = [];

    // WHILE loop to re=ordered by the category "order" property
    while (categories_length !== category_processed) {
      // Check all categories
      this.props.categories.forEach((c, original_index) => {
        // Check the position it should be rendered at in another array.
        // That array is the component this.render_order.
        //
        let actual_position = this.render_order.indexOf(original_index);

        // Need to read the state.category_order... FIXED! I replace c.order with actual_position
        if (actual_position === category_processed) {
          // Produce the two output arrays
          // One for the categories re-ordered
          ordered_categories.push(c);
          // One for their category ID (which is the "original order of the categories array in DB")
          original_indexes.push(original_index);

          // Increment the processed category counter
          category_processed++;
        }
      });
    }

    return { o_cat: ordered_categories, o_id: original_indexes };
  };

  tabChange = () => {
    // Get the LANDING tab ID (activeCat)
    setTimeout(() => {
      let activeCat = parseInt(
        document.querySelector(".RRT__tab--selected").id.split("-")[1]
      );
      console.log("TAB CHANGE", activeCat);
      this.props.dispatch({ type: "tab change", activeCat: activeCat });
    }, 200);
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Tabbed Categories");

    // On initial page load, set activeCat in store.
    if (this.props.activeCat === -1) {
      this.tabChange();
    }

    // ========================================================== CATEGORY ORDERING
    // Get the order from the categories
    this.render_order = this.get_order();

    // Re-order the category elements based on their order property
    let o_data = this.reorder();
    let ordered_categories = o_data.o_cat;
    let original_indexes = o_data.o_id;

    // ========================================================== TABS
    let getTabs = () => {
      return ordered_categories.map((cat, index) => ({
        title:
          // original_indexes[index] +
          // " - " +
          cat.name + " (" + cat.content.length + ")",

        getContent: () => {
          return cat.content.map(cc => {
            return (
              <div className="link_cards_container">
                <Tabbed_Links activeLink={cc} />
              </div>
            );
          });
        },
        /* Optional parameters */
        key: original_indexes[index],
        tabClassName: "tab",
        panelClassName: "panel"
      }));
    };
    // ======================================================================= Return
    return (
      <>
        <Tabs items={getTabs()} onChange={this.tabChange} />
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    categories: state.categories,
    sortable_order: state.sortable_order,
    links: state.links,
    activeCat: state.activeCat
  };
};

// =============================================================================================================== Component connection to the store
let Tabbed_Categories = connect(stp)(U_Tabbed_Categories);
export default Tabbed_Categories;
