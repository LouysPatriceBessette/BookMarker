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
class U_Unsaved extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  // Save all changes
  save = async () => {
    // We have all we need in store...
    // - categories
    // - links
    // - UnsavedChange_details
    // - bank_id
    let data = new FormData();
    data.append("bank_id", this.props.bank_id);
    data.append("categories", JSON.stringify(this.props.categories));

    // Remove the images from the links
    let linksCopy = map_O_spread(this.props.links);
    let imagePurged = linksCopy.map(link => {
      delete link.image;
      return link;
    });
    data.append("links", JSON.stringify(imagePurged));

    data.append("history", JSON.stringify(this.props.unsavedChanges_detail));

    let response = await qf("/save", "POST", data);

    if (response.success) {
      log.ok("Data saved");

      this.props.dispatch({
        type: "changes saved",
        history: response.history
      });
    } else {
      log.error("Data failed to save");
    }
  };

  quit = () => {
    this.props.dispatch({
      type: "quit unsaved changes"
    });
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Unsaved");

    // array of objects
    let all_unsaved = map_O_spread(this.props.unsavedChanges_detail);

    // Reversed display
    all_unsaved.reverse();

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
        ChangedElement = <>New {change.target}</>;
      }

      if (change.property !== "ALL") {
        //ChangedElement = this.props.links[change.index].name;
        ChangedElement = (
          <>
            {" "}
            <b> {change.property}</b> was changed on{" "}
          </>
        );
      }

      // Value to display
      let valueDisplay = (
        <>
          {" "}
          : from <b> {change.oldValue}</b> to <b> {change.newValue}</b>{" "}
        </>
      );

      if (change.property === "ALL") {
        valueDisplay = (
          <>
            {" "}
            : <b> {change.newValue}</b>{" "}
          </>
        );
      }

      if (change.property === "comment" || change.property === "order") {
        valueDisplay = <></>;
      }

      if (change.property === "order" && change.target === "Links") {
        valueDisplay = (
          <>
            {" "}
            for category <b> {change.categoryName}</b>{" "}
          </>
        );
      }

      if (change.property === "image") {
        valueDisplay = (
          <>
            {" "}
            <b> {this.props.links[change.index].name}</b>{" "}
          </>
        );
      }

      if (change.property === "DELETED") {
        ChangedElement = (
          <>
            {" "}
            <b> {change.property} : </b>{" "}
          </>
        );

        valueDisplay = (
          <>
            {" "}
            <b> {this.props.links[change.index].name}</b> from{" "}
            {this.props.categories[this.props.activeCat].name}{" "}
          </>
        );
      }

      return (
        <li
          key={key({
            time: change.time
          })}
        >
          {" "}
          {date_time(change.time).full_Local} | {ChangedElement}
          {valueDisplay}
        </li>
      );
    });

    // ======================================================================= Return
    return (
      <>
        {" "}
        <h1>Unsaved changes list</h1> <ol> {list}</ol>{" "}
        <button className="fctBtn fctBtn_green" onClick={this.save}>
          {" "}
          Save now{" "}
        </button>{" "}
        <button className="fctBtn fctBtn_yellow" onClick={this.quit}>
          {" "}
          I have some more changes to do...{" "}
        </button>{" "}
      </>
    ); // ==================================================================== End return
  }; // End render
}

// End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    unsavedShown: state.unsavedShown,
    unsavedChanges_detail: state.unsavedChanges_detail,
    bank_id: state.bank_id,
    categories: state.categories,
    links: state.links,
    activeCat: state.activeCat
  };
};

// =============================================================================================================== Component connection to the store
let Unsaved = connect(stp)(U_Unsaved);
export default Unsaved;
