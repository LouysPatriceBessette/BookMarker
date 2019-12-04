// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports
import Ratings from "react-ratings-declarative";

// ============================== Quill wysiwyg editor
import Quill from "quill";
import "../quill.css";

// =============================================================================================================== Global functions
import {
  log,
  getRealType,
  map_O_spread,
  date_time,
  currency,
  rsg,
  qf,
  key
} from "../js-lib/_js-setup.js";

let defaultState = {
  name: "",
  href: "",
  rating: 0,
  comment: ""
};
// =============================================================================================================== Component class
class U_Form_add_link extends Component {
  constructor(props) {
    super(props);

    this.state = defaultState;
    this.quill_editor = {};
  }

  // =============================================================================================================== Component functions

  quill_getContent = () => {
    // returns an object
    let Quill_result = this.quill_editor.getContents();
    log.var("Quill content", Quill_result);
    return Quill_result.ops;
  };

  continue = async e => {
    e.preventDefault();

    // What is that form information?
    let input = e.target.closest("form").querySelector("input");

    let info = input.dataset.input;
    let info_value = input.value;

    // If we dont have an input... So it should be the Quill editor.
    if (!info) {
      info = "comment";
      info_value = this.quill_getContent();
    }

    log.error("in continue...");
    console.log(info, info_value);

    // If it's the last step...
    if (info === "comment") {
      log.ok("Last step... The comment.");
      // Copy the actual state
      let nowState = map_O_spread(this.state);

      // add the current info
      nowState[info] = info_value;
      log.var("nowState", JSON.stringify(nowState));
      log.var("activeCat", this.props.activeCat);

      // clear the state
      this.setState(defaultState);

      // Save the link and close the modal
      this.props.dispatch({
        type: "link add",
        link: nowState,
        cat: this.props.activeCat
      });
    }
    // If not the last step, setState
    else {
      // if the URL, send a request to validate the existance of the website
      if (info === "href") {
        let formdata = new FormData();
        formdata.append("url", info_value);
        let response = await qf("/valid-url", "POST", formdata);
        if (response.success) {
          log.ok("VALID URL!!!");
        } else {
          log.error("INVALID URL.");
          return;
        }
      }

      // Save the info in store
      let newState = {};
      newState[info] = info_value;
      this.setState(newState);
    }
  };

  // Star rating handler
  setRating = newRating => {
    this.setState({
      rating: newRating
    });
  };

  componentDidUpdate = () => {
    // Quill container
    let QuillContainer = document.querySelector("#editor");

    if (QuillContainer) {
      // Check if NOT already instantiated
      if (Quill.find(QuillContainer) !== this.quill_editor) {
        // Instantiate Quill
        this.quill_editor = new Quill(QuillContainer, {
          modules: {
            toolbar: [
              [{ header: [1, 2, false] }],
              ["bold", "italic", "underline"]
            ]
          },
          theme: "snow"
        });
        log.ok("Quill initialised...");
      }
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Form_add_folder");

    let errorClassName = "error";
    if (this.props.sl_error) {
      errorClassName += " shown";
    }

    let star = <Ratings.Widget widgetDimension="20px" widgetSpacing="2px" />;

    let form = "";
    switch (true) {
      case this.state.href === "" || this.state.href.indexOf("http") === -1:
        form = (
          <div>
            Link URL:{" "}
            <input
              type="text"
              data-input="href"
              name="href"
              placeholder="http://"
            />
          </div>
        );
        break;

      case this.state.name === "":
        form = (
          <div>
            Link name:{" "}
            <input
              type="text"
              data-input="name"
              name="name"
              placeholder="A name for your link..."
            />
          </div>
        );

        // Strange bug fix
        setTimeout(() => {
          document.querySelector("[name='name']").value = "";
        }, 50);
        break;

      case this.state.comment === "":
        form = (
          <>
            <div>
              <Ratings
                rating={this.state.rating}
                widgetRatedColors="blue"
                changeRating={this.setRating}
              >
                {star}
                {star}
                {star}
                {star}
                {star}
              </Ratings>
            </div>
            <div>
              Link comment:
              {/* <input
                type="text"
                data-input="comment"
                name="comment"
                placeholder="A comment?"
              /> */}
              <div id="quill_Div" className="Quill_in_modal">
                <div id="editor"></div>
              </div>
            </div>
          </>
        );
        break;
    }

    // ======================================================================= Return
    return (
      <>
        <h1>{this.props.modal.title}</h1>
        <form>
          {form}
          <div>
            <p className={errorClassName}>{this.props.modal.title} failed...</p>
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
    activeCat: state.activeCat
  };
};

// =============================================================================================================== Component connection to the store
let Form_add_link = connect(stp)(U_Form_add_link);
export default Form_add_link;
