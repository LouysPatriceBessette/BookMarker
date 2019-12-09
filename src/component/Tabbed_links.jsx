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
class U_Tabbed_Links extends Component {
  constructor(props) {
    super(props);

    this.quill_editor = {};

    this.quill_opened = false;

    this.state = {
      link_rename: ""
    };
  }

  // =============================================================================================================== Component functions

  link_rename = e => {
    let link = this.props.links[this.props.activeLink];
    log.var("Actual link name", link.name);

    // Hide real_link
    document.querySelector(
      "#real_link_" + this.props.activeLink
    ).style.display = "none";

    // Set the input value correcly
    this.setState({ link_rename: link.name });

    // Show the input
    document.querySelector("#real_link_rename_" + this.props.activeLink).type =
      "text";
  };

  link_rename_change = e => {
    // set to state...
    this.setState({ link_rename: e.target.value });
    console.log(e.target.value);
  };

  link_rename_blur = e => {
    log.var("New link name", e.target.value);
    // Fix the link name in links
    this.props.dispatch({
      type: "link name change",
      newName: this.state.link_rename,
      activelink: this.props.activeLink
    });

    // Show real_link
    document.querySelector(
      "#real_link_" + this.props.activeLink
    ).style.display = "inline";

    // Hide the input
    document.querySelector("#real_link_rename_" + this.props.activeLink).type =
      "hidden";
  };

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
    // Starting point is the unique id of the Quill DIV instance
    let editor = document.querySelector("#editor_" + this.props.activeLink);

    // Its wrapping DIV (to be display toggled)
    let Quill_wrapper = editor.closest(".quill_Div");

    // The link card
    let card_div = editor.closest(".link_card");

    // The "normal" comment display DIV (to be display toggled)
    let Link_comment = card_div.querySelector(".Link_comment_Div");

    // if the display properties are not yet set...
    Quill_wrapper.style.display =
      Quill_wrapper.style.display === "" ? "none" : Quill_wrapper.style.display;

    Link_comment.style.display =
      Link_comment.style.display === "" ? "block" : Link_comment.style.display;

    // Toggle the divs
    log.var("Quill display", Quill_wrapper.style.display);
    Quill_wrapper.style.display =
      Quill_wrapper.style.display === "none" ? "block" : "none";

    log.var("Comment display", Link_comment.style.display);
    Link_comment.style.display =
      Link_comment.style.display === "none" ? "block" : "none";

    // Toggle the opened / close state
    this.quill_opened = !this.quill_opened;

    // Have the link_card DIV grow with the content when the editor is opened
    card_div.style.height = this.quill_opened ? "auto" : "400px";
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

  componentDidMount = () => {
    // Quill container
    let QuillContainer = document.querySelector(
      "#editor_" + this.props.activeLink
    );

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
  };

  // =============================================================================================================== Component render
  render = () => {
    log.render("Tabbed_links");

    let link = this.props.links[this.props.activeLink];
    let star = <Ratings.Widget widgetDimension="20px" widgetSpacing="2px" />;

    // ========================================
    // Quill editor formatting
    let linkComment = this.quill_format_object_to_html(link.comment);

    // ======================================================================= Return
    return (
      <>
        <div className="link_card">
          <div className="link_title">
            <div
              id={"real_link_" + this.props.activeLink}
              className="link_name"
              title={link.name}
            >
              {link.name}
            </div>
            <input
              type="hidden"
              id={"real_link_rename_" + this.props.activeLink}
              value={this.state.link_rename}
              onChange={this.link_rename_change}
              onBlur={this.link_rename_blur}
            />
            <FontAwesomeIcon
              icon="edit"
              className="linkCardIcon editName"
              title="Edit name"
              onClick={this.link_rename}
            />
          </div>
          <div className="link_img">
            <a target="_blank" href={link.href}>
              <img src="/image_missing.png" />
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

            <FontAwesomeIcon
              icon="edit"
              className="linkCardIcon editComment"
              title="Edit comment"
              onClick={this.quill_toggle} //quill_getContent}
            />
          </div>

          <div className="Link_comment_Div">{linkComment}</div>

          <div className="quill_Div">
            <div id={"editor_" + this.props.activeLink}></div>
            <button className="fctBtn" onClick={this.quill_getContent}>
              Save
            </button>
          </div>
        </div>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    //activeLink: state.activeLink,
    links: state.links
  };
};

// =============================================================================================================== Component connection to the store
let Tabbed_Links = connect(stp)(U_Tabbed_Links);
export default Tabbed_Links;
