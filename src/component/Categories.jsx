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

// =============================================================================================================== Component class
class U_Categories extends Component {
  constructor(props) {
    super(props);

    this.keyupTimeout = undefined;
    this.keyupDelay = 5000; // 5 sec
    this.state = {
      category_rename: ""
    };
  }

  // =============================================================================================================== Component functions

  contentEditableChange = e => {
    // New category title
    let cat_id = parseInt(e.target.id.split("_")[1]);
    let thisContentEditable = e.target;

    clearTimeout(this.keyupTimeout);
    this.keyupTimeout = setTimeout(() => {
      // User finished typing...
      // Update the store
      // dispatch...

      let newName = thisContentEditable.innerText;
      console.log("Saving new category name", newName);

      this.props.dispatch({
        type: "category name change",
        activeCat: cat_id,
        newName: newName
      });
    }, this.keyupDelay);
  };

  contentEditableBlur = e => {
    // New category title
    let cat_id = parseInt(e.target.id.split("_")[1]);

    let newName = e.target.innerText;
    console.log("Saving new category name", cat_id, newName);

    this.props.dispatch({
      type: "category name change",
      activeCat: cat_id,
      newName: newName
    });
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
    // pseudo element click
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
        log.var("node", n.tagName);

        // Get the catId
        if (n.tagName === "DIV" && n.id) {
          catId = parseInt(n.id.split("_")[1]);
        }
      });

      // Toggle the opened/closed class of the UL
      if (class_opened_closed == "folder-opened") {
        catState = "closed";
      }

      if (class_opened_closed == "folder-closed") {
        catState = "opened";
      }

      // Use the catId to toggle the opened/closed icon and UL display
      this.props.dispatch({
        type: "folder state",
        catId: catId,
        catState: catState
      });
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Categories");

    // ======================================================================= Return
    return (
      <>
        <ul>
          {this.props.categories.map((cat, index) => {
            return (
              <li
                key={key(cat)}
                className={"folder folder-" + cat.state}
                onClick={this.pseudoClick}
              >
                <div
                  id={"cat_" + index}
                  contentEditable="true"
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
          })}
        </ul>
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
