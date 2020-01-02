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
class U_Tabbed_Thumbs extends Component {
  constructor(props) {
    super(props);

    this.quill_editor = undefined;
    this.quill_opened = false;

    this.state = {
      link_rename: this.props.links[this.props.activeLink].name,
      renameFieldDisplayed: false
    };
  }

  // =============================================================================================================== Component functions

  // =============================================================================================================== Component render
  render = () => {
    log.render("Tabbed_Thumbs");

    let link = this.props.links[this.props.activeLink];

    // If link was DELETED
    if (link.deleted) {
      return <></>;
    }

    // ======================================================================= Return
    return (
      <>
        <div
          className="link_card thumbnail"
          key={key({ linkID: this.props.activeLink })}
          data-id={this.props.activeLink}
        >
          <div className="link_img">
            <a target="_blank" href={link.href}>
              <img src={link.image} title={link.name} className="shadowMove" />
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
let Tabbed_Thumbs = connect(stp)(U_Tabbed_Thumbs);
export default Tabbed_Thumbs;
