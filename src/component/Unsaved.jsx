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
class U_Unsaved extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  // =============================================================================================================== Component render
  render = () => {
    log.render("Unsaved");

    // array of objects
    let all_unsaved = this.props.unsavedChanges_detail.reverse();

    // lify the object
    let list = all_unsaved.map(change => {
      // change is an object
      // properties:
      // - target ==> "Link" or "Folder"
      // - index ==> The index of the category or link
      // - property = The changed property. If it is "All", it means a new folder or a new link
      // - oldValue
      // - newValue
      // - time ==> the Unix time of the change

      let ChangedElement = "";
      if (change.property === "ALL") {
        ChangedElement = "New " + change.target;
      }
      if (change.property !== "ALL" && change.target === "Link") {
        ChangedElement = this.props.links[change.index].name;
      }

      // Value to display
      let valueDisplay = change.newValue;
      if (change.property === "comment") {
        valueDisplay = "Comment changed";
      }
      if (change.property === "rating") {
        valueDisplay =
          "Rating changed from " + change.oldValue + " to " + change.newValue;
      }

      return (
        <li>
          {date_time(change.time).iso} | {ChangedElement} :{" "}
          <b>{valueDisplay}</b>
        </li>
      );
    });

    // ======================================================================= Return
    return (
      <>
        <h1>Unsaved changes list</h1>
        <ol>{list}</ol>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    unsavedShown: state.unsavedShown,
    unsavedChanges_detail: state.unsavedChanges_detail,
    links: state.links
  };
};

// =============================================================================================================== Component connection to the store
let Unsaved = connect(stp)(U_Unsaved);
export default Unsaved;
