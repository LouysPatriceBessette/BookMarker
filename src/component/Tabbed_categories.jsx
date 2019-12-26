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

import Tabs from "react-responsive-tabs";
import "react-responsive-tabs/styles.css";

import Tabbed_Links from "./Tabbed_links.jsx";
import Tabbed_Thumbs from "./Tabbed_Thumbs.jsx";

import Bot from "./Bot.jsx";

// =============================================================================================================== Component class
class U_Tabbed_Categories extends Component {
  constructor(props) {
    super(props);

    this.render_order = [];
    this.links_sortable_order = [];

    this.tab_elements = [];
    this.dragging = false;
    this.draggingPosition = { top: 0, left: 0 };
    this.tab_positions = [];

    this.dragged_card = null;
    this.dragged_card_id = null;
    this.hoveredTab = null;

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

  getActiveCat = () => {
    // Tab change in the middle of a drag
    if (this.dragging) {
      log.ok("Tab changed?");

      // Simulate the drop to avoid a Sortable error thrown
      let dragend_event = new Event("dragend");
      this.dragged_card.dispatchEvent(dragend_event);

      // PAS BESOIN DE DISPATCH!

      // this.props.dispatch({
      //   type: "tab change while dragging",
      //   //activeCat: activeCat,
      //   //dragging: this.dragging,
      //   //dragged_card: this.dragged_card,
      //   //dragged_card_id: this.dragged_card_id
      // });

      // Il faudrait parcontre enregistrer le changement dans les unsaved changes...
      // Et simuler un mouseup pour lacher la ghost image.

      // Marche pas...
      let mouseup_event = new Event("mouseup");
      this.dragged_card.dispatchEvent(mouseup_event);

      // RENDU ICI
    }

    // Normal tab mode with a user click
    else {
      // Get the LANDING tab ID (activeCat)
      setTimeout(() => {
        let activeCat = parseInt(
          document.querySelector(".RRT__tab--selected").id.split("-")[1]
        );

        this.props.dispatch({ type: "tab change", activeCat: activeCat }); // Needed for the "Add a link to..." icon in Nav.jsx
      }, 1);
    }
  };

  // Usefull when returning from unsaved changes without saving.
  passActiveCat_toTabs = () => {
    if (this.props.activeCat !== -1) {
      return this.props.activeCat;
    } else {
      let CatToPass = this.get_order()[0];
      return CatToPass;
    }
  };

  onDragStart = e => {
    log.ok("Dragging");
    this.dragging = true;

    this.dragged_card = e.target;
    this.dragged_card_id = e.target.dataset.id;
    log.var("Dragged card", this.dragged_card_id);
  };

  onDrag = e => {
    log.ok("Dragging...");
    this.draggingPosition = { top: e.pageY, left: e.pageX };

    // Check if we are over a tab
    this.tab_positions.forEach((tab, index) => {
      if (
        this.draggingPosition.left > tab.left &&
        this.draggingPosition.left < tab.left + tab.width &&
        this.draggingPosition.top > tab.top &&
        this.draggingPosition.top < tab.top + tab.height
      ) {
        log.ok("TAB FOUND! #" + index);
        this.hoveredTab = index;

        // This make the component to completely re-render.
        this.tabElements[index].click();

        // The good thing is the semi-transparent card still is under the mouse.
        // But a Sortable error is thrown:
        // "Cannot read property"
        // At function _off(el, event, fn){
        //   el.removeEventListener(event, fn, captureMode)
        // }
        // el is null <--------------- Here is the problem Line# 1199
        // event is "dragstart"
        // fn is a function
      }
    });
  };

  // Adapted from this SO answer: https://stackoverflow.com/a/442474/2159528
  getOffset = el => {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: _y, left: _x };
  };

  onDragEnd = e => {
    log.ok("Dragging Finished");
    this.dragging = false;
  };

  // On tab change while dragging
  returnElements = index => {
    if (this.dragging) {
      // Toggle the dragging flag to false
      this.dragging = false;

      // Add the dragged link first in the tab, so the user can see it.
      this.links_sortable_order[index] = map_O_spread(
        [this.dragged_card_id].concat(this.links_sortable_order[index])
      );
    }
    return this.links_sortable_order[index].map(cc => {
      if (this.props.fullCards) {
        return (
          <>
            <Tabbed_Links key={key({ thisCard: cc })} activeLink={cc} />
          </>
        );
      } else {
        return (
          <>
            <Tabbed_Thumbs key={key({ thisCard: cc })} activeLink={cc} />
          </>
        );
      }
    });
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Tabbed Categories");

    // On initial page load, set activeCat in store.
    if (this.props.activeCat === -1) {
      this.getActiveCat();
    }

    this.tabElements = document.querySelectorAll(".RRT__tab.tab");
    this.tabElements.forEach(tab => {
      let tab_object = this.getOffset(tab);
      let compStyle = window.getComputedStyle(tab);

      tab_object.width = parseFloat(compStyle.getPropertyValue("width"));
      tab_object.height = parseFloat(compStyle.getPropertyValue("height"));

      this.tab_positions.push(tab_object);
    });
    log.var("this.tab_positions", this.tab_positions);

    // ========================================================== CATEGORY ORDERING
    // Get the order from the categories
    this.render_order = this.get_order();
    //log.var("this.render_order", this.render_order);

    // Re-order the category elements based on their order property
    let o_data = this.reorder();
    let ordered_categories = o_data.o_cat;
    let original_indexes = o_data.o_id;

    // ========================================================== Links order (Sortable)
    this.links_sortable_order = ordered_categories.map(O_Cat => {
      return O_Cat.content;
    });

    // ========================================================== TABS
    let getTabs = () => {
      return ordered_categories.map((cat, index) => ({
        title:
          // original_indexes[index] +
          // " - " +
          cat.name + " (" + cat.content.length + ")",

        getContent: () => {
          // Have to find its content in the component links_sortable_order instead of in the category.content.
          // Because the order will change.

          return (
            <Sortable
              key={key({ thisTab: cat })}
              //tag="ul" // Defaults to "div"

              onChange={(order, sortable, evt) => {
                //
                // BUG fix...
                // The setTimeout is to dispatch AFTER Sortable is finished dragging.
                //
                setTimeout(() => {
                  // order is an array of STRINGS here... Holding the catIds in the new order
                  // So better have it back to an array of numbers.
                  let thisCatnewOrder = order.map(o => {
                    return parseInt(o);
                  });

                  let previousOrder = this.links_sortable_order;
                  let newOrder = map_O_spread(previousOrder);
                  newOrder[index] = thisCatnewOrder;

                  // log.var("previousOrder", previousOrder); // Il est ici mon fuck de drag n' drop [ [1,2,3,4], [0] ]
                  // log.var("thisCatnewOrder", thisCatnewOrder); // [1,2,4,3]
                  // log.var("newOrder", newOrder); // [ [1,2,4,3], [0] ]

                  this.props.dispatch({
                    type: "links order change",
                    category_id: original_indexes[index],
                    categoryName: cat.name,
                    previousOrder: previousOrder,
                    newOrder: thisCatnewOrder
                  });
                }, 1);
              }}
              onDragStart={this.onDragStart}
              onDrag={this.onDrag}
              onDragEnd={this.onDragEnd}
            >
              {this.returnElements(index)}
            </Sortable>
          );
        }, // END getContent

        /* Optional parameters */
        key: original_indexes[index],
        tabClassName: "tab",
        panelClassName: "panel"
      }));
    };
    // ======================================================================= Return
    return (
      <>
        <Tabs
          items={getTabs()}
          onChange={this.getActiveCat}
          selectedTabKey={this.passActiveCat_toTabs()}
        />
        <Bot />
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    categories: state.categories,
    links: state.links,
    activeCat: state.activeCat,

    // For the thumb/full view
    fullCards: state.fullCards

    // dragging: state.dragging,
    // dragged_card: state.dragged_card,
    // dragged_card_id: state.dragged_card_id
  };
};

// =============================================================================================================== Component connection to the store
let Tabbed_Categories = connect(stp)(U_Tabbed_Categories);
export default Tabbed_Categories;
