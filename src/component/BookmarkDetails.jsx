// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports

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

  // =============================================================================================================== Component render
  render = () => {
    this.setup();
    log.render("BookmarkDetails");

    // Render logic

    if (this.props.activeLink !== -1) {
      let link = this.props.links[parseInt(this.props.activeLink)];

      // ======================================================================= Return
      return (
        <>
          <p>{link.name}</p>
          <p>Star rating: {link.rating}</p>
          <p>{link.href}</p>
          <p>{link.comment}</p>
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
