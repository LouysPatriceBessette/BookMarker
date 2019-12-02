// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports
import Ratings from "react-ratings-declarative";

// =============================================================================================================== Global variables for the functions from the store
let currency, rsg, log, getRealType, map_O_spread, qf, key;

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
  }

  // Set function from the store
  setup = () => {
    currency = this.props.functions.currency;
    rsg = this.props.functions.rsg;
    log = this.props.functions.log;
    getRealType = this.props.functions.getRealType;
    map_O_spread = this.props.functions.map_O_spread;
    qf = this.props.functions.qf;
    key = this.props.functions.key;
  };

  // =============================================================================================================== Component functions

  continue = e => {
    e.preventDefault();

    // Wht is that form information?
    let input = e.target.closest("form").querySelector("input");
    let info = input.dataset.input;
    let info_value = input.value;
    console.log("info:", info, info_value);

    // If it's the last step...
    if (info === "comment") {
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
      let newState = {};
      newState[info] = info_value;
      console.log("newState:", newState);
      this.setState(newState);
    }
  };

  // Star rating handler
  setRating = newRating => {
    this.setState({
      rating: newRating
    });
  };

  // =============================================================================================================== Component render
  render = () => {
    this.setup();
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
              <input
                type="text"
                data-input="comment"
                name="comment"
                placeholder="A comment?"
              />
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
    // Functions from the state
    functions: state.functions,

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
