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
let defaultState = {
  name: "",
  href: "",
  rating: 0,
  comment: ""
};

class U_Form_add_link extends Component {
  constructor(props) {
    super(props);

    this.errorMsg = null;

    this.state = {
      href: ""
    };
  }

  // =============================================================================================================== Component functions

  hrefChange = e => {
    this.setState({ href: e.target.value });

    // Get the error message element
    if (this.errorMsg === null) {
      this.errorMsg = document.querySelector(".error").classList;
    }

    // Remove the error message on change
    this.errorMsg.toggle("shown", false);
  };

  continue = async e => {
    e.preventDefault();

    // If the field at least contains http, fetch the server
    if (this.state.href.indexOf("http") !== -1) {
      // if the URL, send a request to validate the existance of the website
      let formdata = new FormData();
      formdata.append("url", document.querySelector("[name='href']").value);
      let response = await qf("/valid-url", "POST", formdata);
      if (response.success) {
        log.ok("VALID URL!!!");
        this.errorMsg.toggle("shown", false);

        // Trigger the link edit view for the rest
        this.props.dispatch({
          type: "link add",
          link: {
            name: "Give a name",
            href: this.state.href,
            comment: [
              {
                insert: "Add a comment!"
              }
            ],
            rating: 0
          },
          cat:
            this.props.activeCat === -1 || this.props.activeCat === undefined
              ? 0
              : this.props.activeCat
        });
      } else {
        log.error("INVALID URL.");
        this.errorMsg.toggle("shown", true);
        return;
      }
    }

    // Obviously invalid
    else {
      this.errorMsg.toggle("shown", true);
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Form_add_link");

    // ======================================================================= Return
    return (
      <>
        <h1>{this.props.modal.title}</h1>
        <form>
          <div>
            Link URL:{" "}
            <input
              type="text"
              data-input="href"
              name="href"
              placeholder="http://"
              onChange={this.hrefChange}
              value={this.state.href}
            />
          </div>
          <div>
            <p className="error">The url looks invalid.</p>
            <p>
              <button className="logBtn" onClick={this.continue}>
                Submit
              </button>
            </p>
          </div>
        </form>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    modal: state.modal,
    sl_error: state.sl_error,

    // Category index
    categories: state.categories,
    activeCat: state.activeCat,
    links: state.links
  };
};

// =============================================================================================================== Component connection to the store
let Form_add_link = connect(stp)(U_Form_add_link);
export default Form_add_link;
