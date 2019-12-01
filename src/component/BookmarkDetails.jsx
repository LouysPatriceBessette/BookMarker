// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports
import Ratings from "react-ratings-declarative";

// =============================================================================================================== Global variables for the functions from the store
let currency, rsg, log, getRealType, map_O_spread, qf, key;

// =============================================================================================================== Component class
class U_BookmarkDetails extends Component {
  constructor(props) {
    super(props);
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

  changeRating = newRating => {
    this.props.dispatch({
      type: "change rating",
      activeLink: this.props.activeLink,
      rating: newRating
    });

    log.error(
      "Star rating change is saved in store... When to save in DB is the question."
    );
  };
  // =============================================================================================================== Component render
  render = () => {
    this.setup();
    log.render("BookmarkDetails");

    if (this.props.activeLink !== -1) {
      let link = this.props.links[this.props.activeLink];

      let star = <Ratings.Widget widgetDimension="20px" widgetSpacing="2px" />;

      // ======================================================================= Return
      return (
        <>
          <div>
            <a target="_blank" href={link.href}>
              {link.name}
            </a>
          </div>
          <div className="ratingDiv">
            <Ratings
              rating={link.rating}
              widgetRatedColors="blue"
              changeRating={this.changeRating}
            >
              {star}
              {star}
              {star}
              {star}
              {star}
            </Ratings>
          </div>

          <div>{link.comment}</div>
        </>
      ); // ==================================================================== End return
    } else {
      // ======================================================================= Return
      return <></>; // ==================================================================== End return
    }
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Functions from the state
    functions: state.functions,

    // Specific component props from the state here
    activeLink: state.activeLink,
    links: state.links
  };
};

// =============================================================================================================== Component connection to the store
let BookmarkDetails = connect(stp)(U_BookmarkDetails);
export default BookmarkDetails;
