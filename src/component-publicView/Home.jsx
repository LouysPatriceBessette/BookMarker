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

import Form_login from "../component-base/Form_login.jsx";

// =============================================================================================================== Component class
class U_Home extends Component {
  constructor(props) {
    super(props);
  }

  // =============================================================================================================== Component functions

  check = () => {
    return <FontAwesomeIcon icon="check" className="homeIcon check" />;
  };

  times = () => {
    return <FontAwesomeIcon icon="times" className="homeIcon times" />;
  };

  signupNow = () => {
    this.props.dispatch({
      type: "modal",
      content: {
        fetchPath: "signup",
        title: "Sign up",
        component: <Form_login />
      }
    });
  };

  checks_animation_init = () => {
    setTimeout(() => {
      let checks = document.querySelectorAll(".homeIcon");
      //log.ok("init");

      // Show checks one by one
      let checks_animation = () => {
        setTimeout(() => {
          checks.forEach((check, i) => {
            let delay = 800;
            setTimeout(() => {
              //log.ok("one check...");
              check.style.opacity = 1;
            }, delay * i);
          });
        }, 2000);
      };

      // Re-don animation at every 20 sec.
      setInterval(() => {
        // Hide checks
        //log.ok("checks hide");
        checks.forEach(check => {
          check.style.opacity = 0;
        });
        checks_animation();
      }, 12000);
      checks_animation();
    }, 1);
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Home");

    this.checks_animation_init();

    // ======================================================================= Return
    return (
      <>
        <div className="centered">
          <h1>Access your bookmarks from anywhere!</h1>

          <h3>And organize them like never before.</h3>
        </div>
        <div className="homeCentered">
          <img src="/link-preview.png" />
          <ul className="homeUl">
            <li>{this.check()}An image</li>
            <li>{this.check()}A comment</li>
            <li>{this.check()}A star rating</li>
            <li>{this.check()}Drag n' drop ordering</li>
            <li>{this.check()}Tabbed categories</li>
            <li>{this.check()}Keyword search</li>
            <li>{this.check()}Change history and click count</li>
            <li>{this.check()}More secure than a browser bookmark bar!</li>
          </ul>
        </div>
        <div className="centered">
          <h3>Make your browsing easier than ever! Register an account now!</h3>
          <button className="register" onClick={this.signupNow}>
            Signup now!
          </button>
        </div>

        <hr />
        <div>
          <p>
            <b>
              <u>Legal stuff:</u>
            </b>
          </p>
          <p className="legal">* {rsg(6, [16, 20])}</p>
          <hr />
          <p>
            Another meaningful <b>Bes7weB</b> creation. &copy; 2019~2020
          </p>
        </div>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    //...
  };
};

// =============================================================================================================== Component connection to the store
let Home = connect(stp)(U_Home);
export default Home;
