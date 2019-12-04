// =============================================================================================================== Base React imports
import React, { Component } from "react";
import { connect } from "react-redux";

// =============================================================================================================== Other component imports
import Ratings from "react-ratings-declarative";

// ============================== Quill wysiwyg editor
import Quill from "quill";
import "../quill.css";

// =============================================================================================================== Global variables for the functions from the store
let currency, rsg, log, getRealType, map_O_spread, qf, date_time, key;

// =============================================================================================================== Component class
class U_BookmarkDetails extends Component {
  constructor(props) {
    super(props);

    this.quill_editor = {};
  }

  // Set function from the store
  setup = () => {
    currency = this.props.functions.currency;
    rsg = this.props.functions.rsg;
    log = this.props.functions.log;
    getRealType = this.props.functions.getRealType;
    map_O_spread = this.props.functions.map_O_spread;
    qf = this.props.functions.qf;
    date_time = this.props.functions.date_time;
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

  quill_toggle = () => {
    let Quill_editor = document.querySelector("#quill_Div");
    let Link_comment = document.querySelector("#Link_comment_Div");
    let Quill_saveBtn = document.querySelector("#quill_save");

    // if the display properties are not yet set...
    Quill_editor.style.display =
      Quill_editor.style.display === "" ? "none" : Quill_editor.style.display;

    Link_comment.style.display =
      Link_comment.style.display === "" ? "block" : Link_comment.style.display;

    Quill_saveBtn.style.display =
      Quill_saveBtn.style.display === "" ? "none" : Quill_saveBtn.style.display;
    // ========

    // Change the button text
    let toggleBtn = document.querySelector("#quill_open");
    toggleBtn.innerText =
      toggleBtn.innerText === "Edit your comment"
        ? "Close the editor"
        : "Edit your comment";

    // Toggle the divs
    log.var("Quill display", Quill_editor.style.display);
    Quill_editor.style.display =
      Quill_editor.style.display === "none" ? "block" : "none";

    log.var("Comment display", Link_comment.style.display);
    Link_comment.style.display =
      Link_comment.style.display === "none" ? "block" : "none";

    // Save button
    Quill_saveBtn.style.display =
      Quill_saveBtn.style.display === "none" ? "inline-block" : "none";
  };

  quill_getContent = () => {
    // returns an object
    let Quill_result = this.quill_editor.getContents();
    log.var("Quill content", Quill_result);

    // formatting is
    // {"ops":[{"insert":"Rave memories from 1999/2000...\n2nd line\n"},{"attributes":{"bold":true},"insert":"bold text"},{"insert":"\n"}]}

    // So what I need to save is the array named "ops"
    // https://quilljs.com/docs/api/#setcontents

    // Dispatch!
    this.props.dispatch({
      type: "link comment change",
      activelink: this.props.activeLink,
      quill_comment: Quill_result.ops
    });

    //
    // So this Quill_getContent is my SAVE button... And quill_format_object_to_html is the render one.
    //

    // Quill togle! (OFF!)
    this.quill_toggle();
  };

  quill_format_object_to_html = quill_obj => {
    // TEST comment object.
    // Used to test the HTML formatting
    // Set test = true to redo a test
    let test = false;

    let TESTobj = [
      { insert: "Rave memories from 1999/2000...\n\n" },
      { attributes: { bold: true }, insert: "This is bold" },
      { insert: "\n" },
      { attributes: { italic: true }, insert: "This is italic" },
      { insert: "\n" },
      { attributes: { underline: true }, insert: "This is underlined" },
      { insert: "\nThis is a heading 1" },
      { attributes: { header: 1 }, insert: "\n" },
      { insert: "This is a heading 2" },
      { attributes: { header: 2 }, insert: "\n" },
      { insert: "\nThis is a " },
      { attributes: { bold: true }, insert: "mixed" },
      { insert: " line " },
      { attributes: { italic: true }, insert: "with" },
      { insert: " " },
      { attributes: { underline: true }, insert: "many different" },
      { insert: " formattings.\n" }
    ];

    if (test) {
      quill_obj = TESTobj;
    }

    // Variable to skip the next line
    let skipNext = false;

    return quill_obj.map((line, i) => {
      //
      // Got to replace the \n with <br> and apply bold, italic, ect...
      //

      //
      // STEP 0 - Stupid headers with \n as insert value... AND the header attribute on the NEXT line!!!
      //         We actually need the PREVIOUS line for the text, damn... We mapping in order here.
      //

      // Do we have a header ON THE NEXT LINE!
      if (quill_obj[i + 1] && quill_obj[i + 1].attributes) {
        // We have attributes on the next line...
        if (quill_obj[i + 1].attributes.header) {
          // And that attribute is a header
          //
          // So we<ll process the next line NOW.
          // Skip the next map iteration
          skipNext = true;

          // Which header?
          if (quill_obj[i + 1].attributes.header === 1) {
            return <h1>{line.insert}</h1>;
          }
          if (quill_obj[i + 1].attributes.header === 2) {
            return <h2>{line.insert}</h2>;
          }
        }
      }

      // Skip that already processed insert
      if (skipNext) {
        skipNext = false; // Reset the flag.
        return <></>; // Return nothing
      }

      //
      // STEP #1, split by lines... IF there are some \n
      //

      let multiLines = [];

      if (line.insert.indexOf("\n") !== -1) {
        let textLines = line.insert.split("\n");

        // For each string to place before a <br>
        textLines.forEach((tl, i) => {
          multiLines.push(tl);

          // But do not add the line ending <br>
          if (i < textLines.length - 1) {
            multiLines.push(<br />);
          }
        });
      }
      // Just add the string in the finale array to be returned
      else {
        multiLines = line.insert;
      }

      //
      // STEP #2, Add an attribute wrapper...
      //

      if (line.attributes) {
        if (line.attributes.bold) {
          return <b>{multiLines}</b>;
        }
        if (line.attributes.italic) {
          return <i>{multiLines}</i>;
        }
        if (line.attributes.underline) {
          return <u>{multiLines}</u>;
        }
      }

      // Case where there was no \n AND no styling.
      return multiLines;
    });
  };

  componentDidUpdate = () => {
    // If having an active link
    if (this.props.activeLink !== -1) {
      // Quill container
      let QuillContainer = document.querySelector("#editor");

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

      // Set content
      // https://quilljs.com/docs/api/#setcontents
      this.quill_editor.setContents(
        this.props.links[this.props.activeLink].comment
      );
    }
  };

  // =============================================================================================================== Component render
  render = () => {
    this.setup();
    log.render("BookmarkDetails");

    if (this.props.activeLink !== -1) {
      let link = this.props.links[this.props.activeLink];
      let star = <Ratings.Widget widgetDimension="20px" widgetSpacing="2px" />;

      // ========================================
      // Quill editor formatting
      let linkComment = this.quill_format_object_to_html(link.comment);

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

          <div id="Link_comment_Div">{linkComment}</div>

          <div id="quill_Div">
            <div id="editor"></div>
          </div>

          <button
            id="quill_save"
            className="fctBtn"
            onClick={this.quill_getContent}
          >
            Save
          </button>

          <button
            id="quill_open"
            className="fctBtn"
            onClick={this.quill_toggle}
          >
            Edit your comment
          </button>

          <div id="test"></div>
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
