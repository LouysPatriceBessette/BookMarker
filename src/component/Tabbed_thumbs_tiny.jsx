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
          <div className="link_img">
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
    links: state.links
  };
};

// =============================================================================================================== Component connection to the store
let Tabbed_Thumbs_tiny = connect(stp)(U_Tabbed_Thumbs_tiny);
export default Tabbed_Thumbs_tiny;
