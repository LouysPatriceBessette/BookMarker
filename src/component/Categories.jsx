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
  FontAwesomeIcon,
  library,
  fab,
  log,
  getRealType,
  map_O_spread,
  qf,
  date_time,
  currency,
  rsg
} from "../_BATCH-IMPORT.js";

// =============================================================================================================== Other component imports

// Sortable
import uniqueId from "lodash/uniqueId";
import Sortable from "react-sortablejs";

// =============================================================================================================== Component class
class U_Categories extends Component {
  constructor(props) {
    super(props);

    this.render_order = [];

    this.state = {
      category_rename: ""
    };
  }

  // =============================================================================================================== Component functions

  contentEditableBlur = e => {
    // Remove contentEditable
    e.target.contentEditable = "false";

    // New category title
    let cat_id = parseInt(e.target.id.split("_")[1]);

    let newName = e.target.innerText;

    // Make sure there is a change
    if (newName !== this.props.categories[cat_id].name) {
      log.var("Saving new category name", cat_id, newName);
      this.props.dispatch({
        type: "category name change",
        activeCat: cat_id,
        newName: newName
      });
    } else {
      log.ok("No new name to save");
    }
  };

  linkClick = e => {
    e.preventDefault();

    log.var("e.target.text", e.target.text);
    log.var("e.target.id", e.target.id);

    // Link ID
    let linkId = parseInt(e.target.id.split("_")[1]);

    // Category ID
    let catDiv = e.target.closest(".folder").childNodes[0];
    let catId = parseInt(catDiv.id.split("_")[1]);

    this.props.dispatch({ type: "link detail", linkId: linkId, catId: catId });
  };

  pseudoClick = e => {
    // Check if it is a pseudo-element click or a name focus
    //log.var("tag name", e.target.tagName); // LI for the folder image click -- DIV for the categori name.
    if (e.target.tagName === "LI") {
      if (e.target.className.split(" ").includes("folder")) {
        // Remove any previous class (opened or closed) that defines the pseudo image
        let class_opened_closed = e.target.className
          .split(" ")
          .filter(c => {
            return c === "folder-opened" || c === "folder-closed";
          })
          .join(" ");

        // Get the category id form the child div
        let catId;
        let catState;
        e.currentTarget.childNodes.forEach(n => {
          //log.var("node", n.tagName);

          // Get the catId
          if (n.tagName === "DIV" && n.id) {
            catId = parseInt(n.id.split("_")[1]);
            log.var("catId", catId);
          }
        });

        // Toggle the opened/closed class of the UL
        if (class_opened_closed == "folder-opened") {
          catState = "closed";
        }

        if (class_opened_closed == "folder-closed") {
          catState = "opened";
        }
        log.var("catState", catState);

        // Use the catId to toggle the opened/closed icon and UL display
        this.props.dispatch({
          type: "folder state",
          catId: catId,
          catState: catState
        });
      }
    }
    // If the click event was on the DIV
    // Make it content editable
    else if (
      e.target.tagName === "DIV" &&
      e.target.classList.contains("catName")
    ) {
      log.ok("We're on the Category name");
      e.target.contentEditable = "true";
      e.target.focus();
    }
  };

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

  // =============================================================================================================== Component render
  render = () => {
    log.render("Categories");

    this.render_order = this.props.sortable_order;
    // on first render (page load), the render order stored in the store is empty
    // So we dispatch an action to set it right away.
    // The function to produce that order is here, in the component.
    // on subsenquent component rendering, the store value will be the most recent.
    if (this.props.sortable_order.length === 0) {
      this.render_order = this.get_order();
      this.props.dispatch({
        type: "category order setup",
        order: this.render_order
      });
    }

    // Re-order the category elements based on their order property
    let o_data = this.reorder();
    let ordered_categories = o_data.o_cat;
    let original_indexes = o_data.o_id;

    // lify the ordered categories
    let categories_lified = ordered_categories.map((cat, render_index) => {
      return (
        <li
          key={key(cat)}
          className={"folder folder-" + cat.state}
          onClick={this.pseudoClick}
          data-order={cat.order}
          data-id={original_indexes[render_index]} // Needed by Sortable - This is the catId
        >
          <div
            id={"cat_" + original_indexes[render_index]}
            onBlur={this.contentEditableBlur}
            suppressContentEditableWarning={true}
            className="catName"
          >
            {cat.name}{" "}
          </div>
          <div className="catContentLength">({cat.content.length})</div>
          <ul>
            {cat.content.map(content => {
              return (
                <li key={key(this.props.links[content])} className="link">
                  <div>
                    <a id={"link_" + content} onClick={this.linkClick}>
                      {this.props.links[content].name}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </li>
      );
    });

    // ======================================================================= Return
    return (
      <>
        <Sortable
          tag="ul" // Defaults to "div"
          onChange={(order, sortable, evt) => {
            // order is an array of STRINGS here... Holding the catIds in the new order
            // So better have it back to an array of numbers.
            let newOrder = order.map(o => {
              return parseInt(o);
            });

            let previousOrder = this.props.sortable_order;

            this.props.dispatch({
              type: "category order change",
              previousOrder: previousOrder,
              newOrder: newOrder
            });
          }}
        >
          {categories_lified}
        </Sortable>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    username: state.username,
    categories: state.categories,
    sortable_order: state.sortable_order,
    links: state.links
  };
};

// =============================================================================================================== Component connection to the store
let Categories = connect(stp)(U_Categories);
export default Categories;
