import React, { Component } from "react";
import { connect } from "react-redux";

import Categories from "../component/Categories.jsx";
import BookmarkDetails from "../component/BookmarkDetails.jsx";

// Global variables for the functions from the store
let currency;
let rsg;
let log;
let getRealType;
let map_O_spread;

class U_Page extends Component {
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
    log.render("Page");

    // Categories listing
    if (this.props.logged) {
      return (
        <>
          <div className="categoryTree">
            <Categories />
          </div>
          <div className="categoryDisplay">
            <BookmarkDetails />
          </div>
        </>
      );
    } else {
      let pageClass = this.props.overlay ? "blurred" : "";

      return (
        <div className={pageClass}>
          <div>
            <h1>Access your bookmarks from anywhere!</h1>
          </div>
          <div>
            <p>
              This website allows you to store your favorite web links in a new
              parctical way.
            </p>
          </div>

          <div>
            <h2>Share them!</h2>
          </div>
          <div>
            <p>
              This website allows you to store your favorite web links in a new
              practical way.
            </p>
            <p>
              You can have all your links classified as you want and you can
              share them with your friends.
            </p>
            <p>
              <b>Features:</b>
            </p>
            <ul>
              <li>Category sharing</li>
              <li>Drag and drop classification</li>
              <li>Easy edit</li>
              <li>Easy search</li>
              <li>Comments</li>
              <li>Automatic check for broken links</li>
            </ul>
          </div>

          <div>
            <h2>One month free trial.</h2>
          </div>
          <div>
            <p>
              After a month, if you like the service and want to continue using
              it, you will be asked to upgrade to a paid account. That is to
              help us maintain and improve the site.
            </p>
          </div>

          <div>
            <h6>===============</h6>
          </div>
          <div>
            <p className="legal">* {rsg(3)}</p>
          </div>
        </div>
      );
    }
  }; // End render
} // End class

// ===================================================================== Component connect
let stp = state => {
  return {
    functions: state.functions,
    logged: state.logged,
    overlay: state.overlay
  };
};
let Page = connect(stp)(U_Page);

export default Page;
