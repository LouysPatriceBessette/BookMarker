import React, { Component } from "react";
import { connect } from "react-redux";

// Global variables for the functions from the store
let currency;
let rsg;
let log;
let getRealType;
let map_O_spread;

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
  };
  // ================================================================================= Component functions

  render = () => {
    this.setup();
    log.render("BookmarkDetails");

    if (this.props.activeLink !== -1) {
      let link = this.props.links[parseInt(this.props.activeLink)];

      return (
        <>
          <p>{link.name}</p>
          <p>Star rating: {link.rating}</p>
          <p>{link.href}</p>
          <p>{link.comment}</p>
        </>
      );
    } else {
      return <></>;
    }
  }; // End render
} // End class

// ===================================================================== Component connect
let stp = state => {
  return {
    functions: state.functions,
    activeLink: state.activeLink,
    links: state.bank.links
  };
};
let BookmarkDetails = connect(stp)(U_BookmarkDetails);

export default BookmarkDetails;
