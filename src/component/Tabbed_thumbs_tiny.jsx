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
class U_Tabbed_Thumbs_tiny extends Component {
  constructor(props) {
    super(props);

    this.quill_editor = undefined;
    this.quill_opened = false;
  }

  // =============================================================================================================== Component functions

  clickCount = async e => {
    let body = new FormData();
    let linkID = parseInt(e.target.closest(".link_card").dataset.id);
    log.var("Counting this click.", linkID);
    body.append("linkID", linkID);
    body.append("bank_id", this.props.bank_id);
    let response = await qf("/clickCount", "post", body);
    if (response.success) {
      this.props.dispatch({
        type: "click count",
        linkID: linkID,
        newClickDate: response.newClickDate
      });
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Tabbed_Thumbs");

    // Find the link that matches the "real DB index"
    let link = this.props.links.filter(link => {
      return link.linkArrayIndex === this.props.activeLink;
    })[0];

    // If link was DELETED
    if (link.deleted) {
      return <></>;
    }

    // ======================================================================= Return
    return (
      <>
        <div
          className="link_card thumbnail tiny"
          key={key({ linkID: this.props.activeLink })}
          data-id={this.props.activeLink}
        >
          <div className="link_img" onClick={this.clickCount}>
            <a target="_blank" href={link.href}>
              <img
                src={link.image}
                title={link.name}
                className="shadowMove tiny"
              />
            </a>
          </div>
        </div>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    links: state.links,
    bank_id: state.bank_id
  };
};

// =============================================================================================================== Component connection to the store
let Tabbed_Thumbs_tiny = connect(stp)(U_Tabbed_Thumbs_tiny);
export default Tabbed_Thumbs_tiny;
