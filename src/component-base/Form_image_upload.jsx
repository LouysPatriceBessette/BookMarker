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
class U_Form_image_upload extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  upload = e => {
    e.preventDefault();

    let form = event.target.closest("form");
    let input = form.querySelector("#new_image");
    let file = input.value;
    let catId = form.querySelector("#cat_id").value;
    let linkId = form.querySelector("#link_id").value;

    if (file !== "") {
      // Debug...
      //log.var("file", file);
      //log.var("catId", catId);
      //log.var("linkId", linkId);

      // Load the new image in the Edit_link component
      // REFERENCE: MY codePen of 2017-04-01: https://codepen.io/Bes7weB/pen/bqzwda?editors=1010
      //   But also see that one of 2017-05-27 where cropping is easy: https://codepen.io/Bes7weB/pen/GmaZzV?editors=1010
      //
      let reader = new FileReader();
      reader.onload = function() {
        let dataURL = reader.result;
        let output = document.querySelector(".link_img img");
        output.src = dataURL;
      };
      reader.readAsDataURL(input.files[0]);

      // Close modal, remove the whity overlay and udate unsaved changes
      this.props.dispatch({
        type: "link edit image updated"
      });
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Form_image_upload");

    let errorClassName = "error";
    if (this.props.sl_error) {
      errorClassName += " shown";
    }

    // ======================================================================= Return
    return (
      <>
        <h1>{this.props.modal.title}</h1>
        <form>
          <p>
            <input type="file" id="new_image" />
            <input type="hidden" id="cat_id" value={this.props.activeCat} />
            <input type="hidden" id="link_id" value={this.props.activeLink} />
          </p>
          <p className={errorClassName}>{this.props.modal.title} failed...</p>
          <p>
            <button className="logBtn" onClick={this.upload}>
              Submit
            </button>
          </p>
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

    activeCat: state.activeCat,
    activeLink: state.activeLink
  };
};

// =============================================================================================================== Component connection to the store
let Form_image_upload = connect(stp)(U_Form_image_upload);
export default Form_image_upload;
