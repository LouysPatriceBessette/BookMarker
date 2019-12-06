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

    this.state = {
      category_rename: "",
      category_order: this.props.categories.map(c => {
        return c.order;
      })
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

  // =============================================================================================================== Component render
  render = () => {
    log.render("Categories");

    // Variable used to reorder the categories
    let categories_length = this.props.categories.length;
    let category_processed = 0;

    let ordered_categories = [];
    let original_indexes = [];

    // WHILE loop to produce an array of categories ordered byt the category "order" property
    while (categories_length !== category_processed) {
      // Check all categories
      this.props.categories.forEach((c, original_index) => {
        //
        // condition for having it in the order defined in the category property : (c.order === category_processed)
        //
        //
        // condition for having it in the order of the categories (NOT WANT WE WANT)  : (c.order === this.state.category_order[category_processed])
        //

        // THE FIX: I have to find that categorie order as defined in the component state

        let actual_position = this.state.category_order.indexOf(original_index);

        // That should be the ACTUAL position after a drag n' drop
        console.log("actual_position", actual_position, c.name); // That is pefect!!! Exactly that!!

        // Need to read the state.category_order... FIXED! I replace c.order with actual_position
        if (actual_position === category_processed) {
          log.var("Processing...", c.order);
          ordered_categories.push(c);
          original_indexes.push(original_index);
          category_processed++;
        }
      });
    }

    // lify the ordered category array
    let categories_lified = ordered_categories.map((cat, render_index) => {
      //
      // That is ONE category mapping
      //
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
            //contentEditable="true"
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

            let previousOrder = this.state.category_order;
            this.setState({ category_order: newOrder }); // Returned_from_sortable, but procecessed into numbers
            log.var("previousOrder", previousOrder);
            log.var("newOrder", newOrder);

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
    links: state.links
  };
};

// =============================================================================================================== Component connection to the store
let Categories = connect(stp)(U_Categories);
export default Categories;
