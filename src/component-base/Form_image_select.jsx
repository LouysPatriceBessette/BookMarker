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
class U_Form_image_select extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  selectImage_ok = e => {
    e.preventDefault();

    let newImage = document.getElementById("LinkImagePreview").toDataURL();
    setTimeout(() => {
      document.querySelector(".link_img img").src = newImage;
    }, 50);

    // Close modal, remove the whity overlay and udate unsaved changes
    this.props.dispatch({
      type: "link edit image updated"
    });
  };

  // How to retrieve images from the clipboard with JavaScript in the Browser - QUITE ADAPTED HERE ;)
  // Reference: https://ourcodeworld.com/articles/read/491/how-to-retrieve-images-from-the-clipboard-with-javascript-in-the-browser
  //
  retrieveImageFromClipboardAsBlob = (pasteEvent, callback) => {
    if (pasteEvent.clipboardData == false) {
      if (typeof callback == "function") {
        callback(undefined);
      }
    }

    let items = pasteEvent.clipboardData.items;

    if (items == undefined) {
      if (typeof callback == "function") {
        callback(undefined);
      }
    }

    for (let i = 0; i < items.length; i++) {
      // Skip content if not image
      if (items[i].type.indexOf("image") == -1) continue;

      // Retrieve image on clipboard as blob
      let blob = items[i].getAsFile();

      if (typeof callback == "function") {
        callback(blob, true);
      }
    }
  };

  SetImageInCanvas = (data, imageBlob) => {
    if (data) {
      let canvas = document.getElementById("LinkImagePreview");
      let ctx = canvas.getContext("2d");
      let img = new Image();

      // Async image load
      img.onload = function() {
        // Update dimensions of the canvas with the dimensions of the image
        canvas.width = this.width;
        canvas.height = this.height;

        // Draw
        ctx.drawImage(img, 0, 0);
      };

      // if it's an image blog (from clipboard paste)
      if (imageBlob) {
        // Crossbrowser support for URL
        let URLObj = window.URL || window.webkitURL;

        // Set the image in the canvas
        img.src = URLObj.createObjectURL(data);
      }

      // if it's a file from computer
      else {
        img.src = data;
      }
    }
  };

  fileChange = e => {
    let reader = new FileReader();

    // Async onLoad
    reader.onload = () => {
      let dataURL = reader.result;

      // Place the image in the preview box
      this.SetImageInCanvas(dataURL, false);
    };

    // Read the file from the file input
    reader.readAsDataURL(document.querySelector("#new_image").files[0]);
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Form_image_selection");

    window.addEventListener(
      "paste",
      e => {
        // Handle the event
        this.retrieveImageFromClipboardAsBlob(e, this.SetImageInCanvas);
      },
      false
    );

    // ======================================================================= Return
    return (
      <>
        <h1>{this.props.modal.title}</h1>
        <form className="imageSelection">
          <canvas id="LinkImagePreview" />
          <h3>Select a file from your computer:</h3>

          <div>
            <input type="file" id="new_image" onChange={this.fileChange} />
          </div>
          <h3>Or simply paste a screen capture.</h3>

          <div>
            <button className="logBtn" onClick={this.selectImage_ok}>
              Ok
            </button>
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

    activeCat: state.activeCat,
    activeLink: state.activeLink
  };
};

// =============================================================================================================== Component connection to the store
let Form_image_select = connect(stp)(U_Form_image_select);
export default Form_image_select;
