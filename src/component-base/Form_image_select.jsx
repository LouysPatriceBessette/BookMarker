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

    this.imageMove = false;
    this.canvas = null;
    this.canvasPostion = { top: 0, left: 0 };
    this.ctx = null;
    this.imageBase64 = null;
    this.imgElement = null;
    this.imageReady = false;
    this.width = 200;
    this.height = 200;
    this.imagePositionInCanvas = { top: 0, left: 0 };
    this.clickStartPostion = { top: 0, left: 0 };
    this.imageBorderHint_Container = null;
    this.imageBorderHint = null;
  }

  // =============================================================================================================== Component functions

  // Size calculation function found : https://edupala.com/calculate-base64-image-size/
  calculateImageSize(base64String) {
    let padding, inBytes, base64StringLength;
    if (base64String.endsWith("==")) padding = 2;
    else if (base64String.endsWith("=")) padding = 1;
    else padding = 0;

    base64StringLength = base64String.length;
    //console.log(base64StringLength);
    inBytes = (base64StringLength / 4) * 3 - padding;
    //console.log(inBytes);
    this.kbytes = inBytes / 1000;
    return this.kbytes;
  }

  selectImage_ok = e => {
    e.preventDefault();

    let newImage = document.getElementById("LinkImagePreview").toDataURL();

    // Get the image size in Kb
    let imageSize = this.calculateImageSize(newImage);
    log.var("imageSize in Kb", imageSize);

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
      // Get the canvas position
      this.canvas = document.getElementById("LinkImagePreview");
      this.canvasPostion = this.getOffset(this.canvas);
      this.ctx = this.canvas.getContext("2d");

      // Get the image border hint element
      this.imageBorderHint_Container = document.querySelector(
        ".imageBorderHint_Container"
      );
      this.imageBorderHint = document.querySelector(".imageBorderHint");

      // Get the image in Base64
      this.imgElement = new Image();

      // Async image load
      this.imgElement.onload = () => {
        this.imageReady = true;
        log.ok("Image is ready");

        // Make sure about the canvas dimensions
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Store the image dimentions
        this.imageDimentions = {
          width: this.imgElement.width,
          height: this.imgElement.height
        };

        // Draw
        this.ctx.drawImage(this.imgElement, 0, 0);
      };

      // if it's an image blog (from clipboard paste)
      if (imageBlob) {
        // Crossbrowser support for URL
        let URLObj = window.URL || window.webkitURL;

        // Set the image in the canvas
        this.imgElement.src = URLObj.createObjectURL(data);
      }

      // if it's a file from computer
      else {
        this.imgElement.src = data;
      }

      // Keep the whole image before canvas crops it
      this.imageBase64 = this.imgElement.src;

      // Fill the image border hint with the image
      this.imageBorderHint.src = this.imageBase64;
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

  enableMoveImageInCanvas = e => {
    log.var("e type", e.type);
    let clickPreventer = document.querySelector(".clickPreventer");

    // Mouse Down... The dragging begins
    if (e.type === "mousedown") {
      this.imageMove = true;
      log.ok("MouseDown");

      // Display a big div over the whole page to prevent click events
      clickPreventer.classList.toggle("noclick", true);

      // Get the mouse position minus the actual position of the image in canvas
      // To calculate new positioning on mouse move
      this.clickStartPostion = {
        top: e.pageY - this.imagePositionInCanvas.top,
        left: e.pageX - this.imagePositionInCanvas.left
      };
    }

    // Mouse Up... The dragging ends
    if (e.type === "mouseup") {
      this.imageMove = false;
      log.ok("Mouseup");
      clickPreventer.classList.toggle("noclick", false);

      // Hide the image border hint
      this.imageBorderHint_Container.style.display = "none";
      this.imageBorderHint.style.width = 0 + "px";
      this.imageBorderHint.style.height = 0 + "px";
    }
  };

  // Adapted from this SO answer: https://stackoverflow.com/a/442474/2159528
  getOffset = el => {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: _y, left: _x };
  };

  moveImageInCanvas = e => {
    // Mouse move event
    // Only if the mouse is down and the image has loaded
    if (this.imageMove && this.imageReady) {
      // Show the image border hint
      this.imageBorderHint_Container.style.display = "block";
      this.imageBorderHint.style.width = this.imageDimentions.width + "px";
      this.imageBorderHint.style.height = this.imageDimentions.height + "px";

      let x = e.pageX - this.clickStartPostion.left;
      let y = e.pageY - this.clickStartPostion.top;

      // Save image position
      this.imagePositionInCanvas = { top: y, left: x };

      // Move the image border hint
      this.imageBorderHint.style.top =
        this.imagePositionInCanvas.top + this.canvasPostion.top + "px";
      this.imageBorderHint.style.left =
        this.imagePositionInCanvas.left + this.canvasPostion.left + "px";

      // Draw - Adapted from SO answer: https://stackoverflow.com/a/30815443/2159528
      requestAnimationFrame(() => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.imgElement, x, y);
      });
    }
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

    window.addEventListener("mousemove", this.moveImageInCanvas);
    // window.addEventListener("mouseup", this.enableMoveImageInCanvas);

    // ======================================================================= Return
    return (
      <>
        <h1>{this.props.modal.title}</h1>
        <form className="imageSelection">
          <canvas
            id="LinkImagePreview"
            onMouseDown={this.enableMoveImageInCanvas}
            // onMouseUp={this.enableMoveImageInCanvas}
            // onMouseMove={this.moveImageInCanvas}
          />
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
        <div
          className="clickPreventer"
          onMouseUp={this.enableMoveImageInCanvas}
        ></div>
        <div className="imageBorderHint_Container">
          <img className="imageBorderHint" />
        </div>
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
