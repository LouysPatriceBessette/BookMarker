// =============================================================================================================== BATCH IMPORT
import {
  React,
  Component,
  BrowserRouter,
  Route,
  Link,
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

import Form_add_folder from "./Form_add_folder.jsx";
import Form_add_link from "./Form_add_link.jsx";

// =============================================================================================================== Component class
class U_Context extends Component {
  constructor(props) {
    super(props);

    this.contextMenu_params = {
      eventHandlerSetted: false,
      element: null,
      style: {
        display: "none",
        left: 0 + "px",
        top: 0 + "px"
      },
      activeLink: null,
      link_card: null
    };
  }

  // =============================================================================================================== Component functions

  // ================================================== Context Menu functions
  toggleDisplay = e => {
    if (e.type === "click") {
      this.contextMenu_params.element.style.display = "none";
      return;
    }
    this.contextMenu_params.element.style.top = this.contextMenu_params.style.top;
    this.contextMenu_params.element.style.left = this.contextMenu_params.style.left;
    this.contextMenu_params.element.style.display = this.contextMenu_params.style.display;
  };

  contextMenu = e => {
    e.preventDefault();

    // if the context menu was fired over a link_card
    let link_card = e.target.closest(".link_card");

    // Clicked on a link_card?
    if (link_card) {
      // Save link_card element
      this.contextMenu_params.link_card = link_card;
      this.contextMenu_params.activeLink = parseInt(link_card.dataset.id);

      // Muliple window event listener bug when a new link is added - fix
      log.var("74 - this.props.links.length", this.props.links.length);

      if (this.props.links[this.contextMenu_params.activeLink] === undefined) {
        return;
      }

      // set the active link name in context menu span
      this.contextMenu_params.element.querySelector(
        ".activeLinkName"
      ).innerText = this.props.links[this.contextMenu_params.activeLink].name;

      // Show options for the link edit
      this.contextMenu_params.element.querySelector(".linkName").style.display =
        "block";

      // Is there some other change history for that link?
      let linkCreationDate = this.props.history.filter(history_log => {
        return (
          history_log.target === "Link" &&
          history_log.index === this.contextMenu_params.activeLink &&
          history_log.property === "ALL"
        );
      });

      if (linkCreationDate.length !== 1) {
        // The date was not found in the state history (so the link is still unsaved)
        linkCreationDate = this.props.unsavedChanges_detail.filter(
          history_log => {
            return (
              history_log.target === "Link" &&
              history_log.index === this.contextMenu_params.activeLink &&
              history_log.property === "ALL"
            );
          }
        );
      }

      let Link_date = date_time(linkCreationDate[0].time).full_Local;
      this.contextMenu_params.element.querySelector(
        ".link_creation_date"
      ).innerText = Link_date;

      // How many time clicked?
      let Link_clicked_times = this.props.links[
        this.contextMenu_params.activeLink
      ].clickCount.length;
      let Link_clicked_details = this.props.links[
        this.contextMenu_params.activeLink
      ].clickCount
        .map(detail => {
          log.var(detail.date);
          return date_time(detail.date).full_Local;
        })
        .join("\n");
      this.contextMenu_params.element.querySelector(
        ".link_clicked_times"
      ).innerText = Link_clicked_times;
      if (Link_clicked_times > 1) {
        this.contextMenu_params.element.querySelector(
          ".clicked_plural"
        ).innerText = "s";
      }
      // Click history
      if (Link_clicked_times > 0) {
        this.contextMenu_params.element.querySelector(
          ".feak_anchor"
        ).innerText = "Click history";
        this.contextMenu_params.element.querySelector(
          ".click_history"
        ).style.display = "inline-block";
        let content_div = this.contextMenu_params.element.querySelector(
          ".click_history_content"
        );
        content_div.innerText = Link_clicked_details;
        //content_div.style.display = "block";
      }

      // Is there some other change history for that link?
      let changeAmount = this.props.history.filter(history_log => {
        return (
          history_log.target === "Link" &&
          history_log.index === this.contextMenu_params.activeLink &&
          history_log.property !== "ALL"
        );
      });

      // Show/hide "View change history"
      if (changeAmount.length > 0) {
        this.contextMenu_params.element.querySelector(
          ".link_history"
        ).style.display = "block";
      } else {
        this.contextMenu_params.element.querySelector(
          ".link_history"
        ).style.display = "none";
      }
    }

    // Do not show options for the link edit
    else {
      this.contextMenu_params.element.querySelector(".linkName").style.display =
        "none";
    }

    // If there are changes to save
    if (this.props.unsavedChanges) {
      // Set the number of changes to be saved
      this.contextMenu_params.element.querySelector(
        ".changeCount"
      ).innerText = this.props.unsavedChanges_detail.length;

      // Set the plural form - manyChanges
      if (this.props.unsavedChanges_detail.length > 1) {
        this.contextMenu_params.element.querySelector(
          ".manyChanges"
        ).innerText = "s";
      } else {
        this.contextMenu_params.element.querySelector(
          ".manyChanges"
        ).innerText = "";
      }

      // Display "Save x changes" option
      this.contextMenu_params.element.querySelector(
        ".saveChanges"
      ).style.display = "block";
    } else {
      this.contextMenu_params.element.querySelector(
        ".saveChanges"
      ).style.display = "none";
    }

    this.contextMenu_params.style = {
      display: "block",
      left: e.pageX + "px",
      top: e.pageY + "px"
    };
    this.toggleDisplay(e);
  };

  set_contextMenu = () => {
    // Muliple window event listener bug when a new link is added
    log.var("175 - this.props.links.length", this.props.links.length);

    // Apply a custom context menu on
    this.contextMenu_params.element = document.querySelector(".context");
    window.addEventListener("contextmenu", this.contextMenu);
    window.addEventListener("click", e => {
      this.toggleDisplay(e);
    });
  };

  activeFolderName = () => {
    let folderName = this.props.categories[this.props.activeCat] || null;
    if (folderName) {
      return folderName.name;
    } else {
      return "...";
    }
  };

  isLinkHistory = () => {};

  // ================================================== Menu item click functions - Copied fron nav.jsx
  logout = async () => {
    log.ok("Logging out.\n\n");
    let response = await qf("/logout", "post");

    if (response.success) {
      this.props.dispatch({ type: "logout" });
    }
  };

  // Add a new folder
  add_folder = () => {
    this.props.dispatch({
      type: "modal",
      content: {
        title: "Add a folder",
        component: <Form_add_folder />
      }
    });
  };

  add_link = () => {
    this.props.dispatch({
      type: "modal",
      content: {
        title: "Add a link",
        component: <Form_add_link />
      }
    });
  };

  unsavedChanges_display = () => {
    this.props.dispatch({ type: "display unsaved changes" });
  };

  // ================================================== Menu item click functions

  edit_link = () => {
    //log.ok("edit_link");
    this.props.dispatch({
      type: "link edit display",
      linkId: this.contextMenu_params.activeLink
    });
  };

  click_history_show = e => {
    let content_div = this.contextMenu_params.element.querySelector(
      ".click_history_content"
    );
    content_div.style.top =
      e.pageY - parseInt(this.contextMenu_params.style.top) + 40 + "px";
    content_div.style.left =
      e.pageX - parseInt(this.contextMenu_params.style.left) + 20 + "px";
    content_div.style.display = "block";
  };
  click_history_hide = e => {
    let content_div = this.contextMenu_params.element.querySelector(
      ".click_history_content"
    );
    content_div.style.display = "none";
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Context");

    setTimeout(this.set_contextMenu, 1);

    // ======================================================================= Return
    return (
      <>
        <div className="context">
          <ul className="context-options">
            <li className="context-option" onClick={this.add_folder}>
              Add a folder
            </li>
            <li className="context-option" onClick={this.add_link}>
              Add a link to {this.activeFolderName()}
            </li>
            <li className="context-option-noClick linkName">
              <span className="activeLinkName">...</span>
              <ul className="context-options">
                <li className="context-option-noClick linkInfo">
                  Added on <span className="link_creation_date"></span>
                </li>
                <li className="context-option-noClick linkInfo">
                  Clicked <span className="link_clicked_times"></span> time
                  <span className="clicked_plural"></span>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="click_history">
                    <a
                      className="feak_anchor"
                      onMouseEnter={this.click_history_show}
                      onMouseLeave={this.click_history_hide}
                    >
                      Click history
                    </a>
                  </span>
                </li>
                <li className="context-option-noClick link_history notDoneYet">
                  View change history
                </li>
                <li className="context-option" onClick={this.edit_link}>
                  Edit
                </li>
              </ul>
            </li>
            <li
              className="context-option saveChanges"
              onClick={this.unsavedChanges_display}
            >
              Save&nbsp;&nbsp;<span className="changeCount"></span>
              &nbsp;&nbsp; recent change<span className="manyChanges"></span>{" "}
            </li>
            <li className="context-option-noClick notDoneYet">My settings</li>
            <li className="context-option" onClick={this.logout}>
              Logout
            </li>
          </ul>
          <div className="click_history_content"></div>
        </div>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    categories: state.categories,
    links: state.links,
    history: state.history,
    activeCat: state.activeCat,
    unsavedChanges: state.unsavedChanges,
    unsavedChanges_detail: state.unsavedChanges_detail
  };
};

// =============================================================================================================== Component connection to the store
let Context = connect(stp)(U_Context);
export default Context;
