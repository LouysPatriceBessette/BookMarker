// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports

// =============================================================================================================== Global variables for the functions from the store
let currency, rsg, log, getRealType, map_O_spread;

// =============================================================================================================== Component class
class U_Categories extends Component {
  constructor(props) {
    super(props);
  }

  // Set function from the store
  setup = () => {
    currency = this.props.functions.currency;
    rsg = this.props.functions.rsg;
    log = this.props.functions.log;
    getRealType = this.props.functions.getRealType;
    map_O_spread = this.props.functions.map_O_spread;
  };
  // =============================================================================================================== Component functions

  contentEditableChange = e => {
    // New category title
    let newContent = e.target.innerHTML;
    log.var("contentEditable change", newContent);

    // Retreive info about where to change the data
    log.var("user id", this.props.userId);
    log.var("category", e.target.id);
    log.var("this.props.bank", this.props.bank);

    // Exact data to change
    let item = this.props.bank.categories[parseInt(e.target.id.split("_")[1])];
    let itemName = item.name;
    log.var("To change", itemName);

    // Changing the props directly.... WRONG!
    //item.name = newContent
    //log.var("new bank!",this.props.bank)

    //log.error("HERE!")

    // Creating a deep copy of this.props.bank
    let newBank = map_O_spread(this.props.bank);
    newBank.categories[parseInt(e.target.id.split("_")[1])].name = newContent;
    log.var("this.props.bank", this.props.bank);
    log.var("new bank!", newBank);

    log.error("HERE!");

    // Update the App store
    //dispatch( {type: "category_change", content: newBank} )
  };

  linkClick = e => {
    e.preventDefault();

    log.var("e.target.text", e.target.text);
    log.var("e.target.id", e.target.id);

    let linkId = e.target.id.split("_")[1];
    this.props.dispatch({ type: "link_detail", content: linkId });
  };

  pseudoClick = e => {
    // pseudo element click
    if (e.target.className.split(" ").includes("folder")) {
      // Remove any previous class (opened or closed) that defines the pseudo image
      let classes = e.target.className.split(" ").filter(c => {
        return c !== "folder-opened" && c !== "folder-closed";
      });

      // Change the opened/closed icon
      // And get the category id form the child div
      let catId;
      let catState;
      e.currentTarget.childNodes.forEach(n => {
        log.var("node", n.tagName);
        if (n.tagName === "UL" && n.style.display === "block") {
          // FAILS ???
          log.var("n.style.display 1", n.style.display);
          n.style.display = "none";
          e.target.className = classes + " folder-closed";
          catState = "closed";
        } else {
          //else if(n.tagName==="UL" && n.style.display==="none"){  // FAILS ???
          log.var("n.style.display 2", n.style.display);
          n.style.display = "block";
          e.target.className = classes + " folder-opened";
          catState = "opened";
        }
        if (n.tagName === "DIV") {
          catId = n.id.split("_")[1];
        }
        log.var("n.style.display 3", n.style.display);
      });

      // Change the "current folder opened" in the App state...
      //
      // TODO!
      log.error("HERE! Categories.jsx - line ~84");

      log.var("catId", catId);
      log.var("catState", catState);
      this.props.dispatch({
        type: "folder state",
        content: { catId, catState }
      });
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    this.setup();
    log.render("Categories");

    // Render logic

    // ======================================================================= Return
    return (
      <>
        <ul>
          {this.props.bank.categories.map((cat, index) => {
            return (
              <li
                key={key(cat)}
                className={"folder folder-" + cat.state}
                onClick={this.pseudoClick}
              >
                <div
                  id={"cat_" + index}
                  contentEditable="true"
                  onInput={this.contentEditableChange}
                  suppressContentEditableWarning={true}
                >
                  {cat.name}{" "}
                  <span className="catContentLength">
                    ({cat.content.length})
                  </span>
                </div>
                <ul>
                  {cat.content.map(content => {
                    return (
                      <li
                        key={key(this.props.bank.links[content])}
                        className="link"
                      >
                        <div>
                          <a id={"link_" + content} onClick={this.linkClick}>
                            {this.props.bank.links[content].name}
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
    // Functions from the state
    functions: state.functions,

    // Specific component props from the state here
    userId: state.userId,
    bank: state.bank
  };
};

// =============================================================================================================== Component connection to the store
let Categories = connect(stp)(U_Categories);
export default Categories;
