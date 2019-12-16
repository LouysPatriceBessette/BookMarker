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
  ReactCrop,
  log,
  getRealType,
  map_O_spread,
  qf,
  date_time,
  currency,
  rsg
} from "../_BATCH-IMPORT.js";

// =============================================================================================================== Other component imports

import Form_image_select from "../component-base/Form_image_select.jsx";

// =============================================================================================================== Component class
class U_Edit_Link extends Component {
  constructor(props) {
    super(props);

    this.quill_editor = undefined;
    this.quill_opened = false;

    this.state = {
      link_rename: this.props.links[this.props.activeLink].name,
      renameFieldDisplayed: false,
      crop: {
        aspect: 16 / 9
      }
    };
  }

  // =============================================================================================================== Component functions

  link_rename_show = e => {
    let link = this.props.links[this.props.activeLink];
    //("Actual link name", link.name);

    // Set the input value on input show ant toggle the flag
    if (this.state.renameFieldDisplayed) {
      this.setState({
        link_rename: link.name,
        renameFieldDisplayed: !this.state.renameFieldDisplayed
      });
    }

    // Just toggle the flag
    else {
      this.setState({ renameFieldDisplayed: !this.state.renameFieldDisplayed });
    }
  };

  link_rename_keyup = e => {
    // Blur on [ENTER]
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  link_rename_change = e => {
    // set to state...
    this.setState({ link_rename: e.target.value });
  };

  link_rename_blur = e => {
    let previousName = this.props.links[this.props.activeLink].name;

    if (previousName !== this.state.link_rename) {
      // Fix the link name in links
      this.props.dispatch({
        type: "link name change",
        newName: this.state.link_rename,
        activelink: this.props.activeLink
      });
    }

    // Set state
    this.setState({ renameFieldDisplayed: !this.state.renameFieldDisplayed });
  };

  changeRating = newRating => {
    // Save the rating in store
    this.props.dispatch({
      type: "change rating",
      activeLink: this.props.activeLink,
      rating: newRating
    });
  };

  init_quill = () => {
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

  quill_toggle = e => {
    // Init Quill
    this.init_quill();

    // Starting point is the unique id of the Quill DIV instance
    let editor = document.querySelector("#editor_" + this.props.activeLink);

    // Its wrapping DIV (to be display toggled)
    let Quill_wrapper = editor.closest(".quill_Div");

    // The link card
    let card_div = editor.closest(".link_card_edit");

    // The "normal" comment display DIV (to be display toggled)
    let Link_comment = card_div.querySelector(".Link_comment_Div");

    // if the display properties are not yet set...
    Quill_wrapper.style.display =
      Quill_wrapper.style.display === "" ? "none" : Quill_wrapper.style.display;

    Link_comment.style.display =
      Link_comment.style.display === "" ? "block" : Link_comment.style.display;

    // Toggle the divs
    //log.var("Quill display", Quill_wrapper.style.display);
    Quill_wrapper.style.display =
      Quill_wrapper.style.display === "none" ? "block" : "none";

    //log.var("Comment display", Link_comment.style.display);
    Link_comment.style.display =
      Link_comment.style.display === "none" ? "block" : "none";

    // Toggle the opened / close state
    this.quill_opened = !this.quill_opened;

    // Have the link_card_edit DIV grow with the content when the editor is opened
    card_div.style.height = this.quill_opened ? "auto" : "400px";

    // BUG!!! Force focus...
    //this.focus_Quill(e);
  };

  quill_getContent = () => {
    // returns an object
    let Quill_result = this.quill_editor.getContents();
    //log.var("Quill content", Quill_result);

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
          // So we'll process the next line NOW.
          // Skip the next map iteration
          skipNext = true;

          // Which header?
          if (quill_obj[i + 1].attributes.header === 1) {
            return <h1 key={key({ thisLine: line.insert })}>{line.insert}</h1>;
          }
          if (quill_obj[i + 1].attributes.header === 2) {
            return <h2 key={key({ thisLine: line.insert })}>{line.insert}</h2>;
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
          return <b key={key({ thisLine: multiLines })}>{multiLines}</b>;
        }
        if (line.attributes.italic) {
          return <i key={key({ thisLine: multiLines })}>{multiLines}</i>;
        }
        if (line.attributes.underline) {
          return <u key={key({ thisLine: multiLines })}>{multiLines}</u>;
        }
      }

      // Case where there was no \n AND no styling.
      return <span key={key({ thisLine: multiLines })}>{multiLines}</span>;
    });
  };

  // BUG!!! Force focus on Quill... Not perfect.
  focus_Quill = e => {
    //log.ok("focus_Quill");
    e.stopPropagation();
    let quill_edit_zone = e.target
      .closest(".link_card_edit")
      .querySelector(".ql-editor");

    quill_edit_zone.focus();
  };

  editImage = () => {
    this.props.dispatch({
      type: "modal",
      content: {
        title: "Select an image",
        component: <Form_image_select />
      }
    });
  };

  acceptImage = () => {
    let acceptedImg = document.querySelector(".link_img img").src;

    this.props.dispatch({
      type: "Accept an image",
      activeLink: this.props.activeLink,
      base64_img: acceptedImg
    });
  };

  editImage_quit = () => {
    this.props.dispatch({
      type: "quit link edit"
    });
  };

  /* =============================================== Image cropping DELAYED after project presentation
  crop_it = crop => {
    if (this.state.crop.height !== crop.height) {
      this.setState({ crop });
      log.var("crop", crop);
    }
  };

  cropDemo = ({ src }) => {
    const [crop, setCrop] = useState({ aspect: 16 / 9 });
    return (
      <ReactCrop src={src} crop={crop} onChange={newCrop => setCrop(newCrop)} />
    );
  };
  */

  // =============================================================================================================== Component render
  render = () => {
    log.render("Edit_link");

    let link = this.props.links[this.props.activeLink];
    let star = <Ratings.Widget widgetDimension="20px" widgetSpacing="2px" />;

    let link_rename_input_or_not = () => {
      if (this.state.renameFieldDisplayed) {
        setTimeout(() => {
          document
            .querySelector("#real_link_rename_" + this.props.activeLink)
            .focus();
        }, 1);
        return (
          <input
            type="text"
            id={"real_link_rename_" + this.props.activeLink}
            value={this.state.link_rename}
            onKeyUp={this.link_rename_keyup}
            onChange={this.link_rename_change}
            onBlur={this.link_rename_blur}
          />
        );
      } else {
        return (
          <div
            id={"real_link_" + this.props.activeLink}
            className="link_name"
            title={link.name}
          >
            {link.name}
          </div>
        );
      }
    };

    // ========================================
    // Quill editor formatting
    let linkComment = this.quill_format_object_to_html(link.comment);

    // Set the underlay or not
    let underlay = () => {
      if (this.props.image_accepted) {
        return "";
      } else {
        return "editImage_underlay";
      }
    };

    // image edit icons
    let image_edit_icons = () => {
      switch (true) {
        case !this.props.image_edited:
          return (
            <>
              <FontAwesomeIcon
                icon="edit"
                className="linkCardIcon editImage_alone"
                title="Edit image"
                onClick={this.editImage}
              />
            </>
          );
          break;

        case this.props.image_accepted:
          return <></>;
          break;

        default:
          return (
            <>
              <FontAwesomeIcon
                icon="edit"
                className="linkCardIcon editImage_both"
                title="Edit image"
                onClick={this.editImage}
              />
              <FontAwesomeIcon
                icon="check"
                className="linkCardIcon editImage_ok"
                title="Accept image"
                onClick={this.acceptImage}
              />
            </>
          );
      }
    };

    // ======================================================================= Return
    return (
      <>
        <div className="linkEdit_header">
          <h1>Edit link</h1>
        </div>
        <div className="linkEdit_main">
          <div
            className="link_card_edit"
            key={key({ linkID: this.props.activeLink })}
            data-id={this.props.activeLink}
          >
            <span className="dragIcon" title="Drag me!"></span>
            <div className="link_title">
              {link_rename_input_or_not()}
              <FontAwesomeIcon
                icon="edit"
                className="linkCardIcon editName"
                title="Edit name"
                onClick={this.link_rename_show}
              />
            </div>
            <div className="link_img">
              <div className={underlay()}>{image_edit_icons()}</div>
              <img src={link.image} />
            </div>
            <div className="ratingDiv">
              <Ratings
                rating={link.rating}
                widgetRatedColors="lightgrey" // Disabled color
                // changeRating={this.changeRating} // DISABLED.... mmm... Re-enable?
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
                onClick={this.quill_toggle}
              />
            </div>
            <div className="Link_comment_Div">{linkComment}</div>
            <div className="quill_Div">
              <div
                id={"editor_" + this.props.activeLink}
                //onMouseDown={this.focus_Quill}
                //onPointerDown={this.focus_Quill}
              ></div>
              <button className="fctBtn" onClick={this.quill_getContent}>
                Save
              </button>
            </div>
            <button
              className="fctBtn floating_out"
              onClick={this.editImage_quit}
            >
              Finished editing
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
    links: state.links,
    linkEdit: state.linkEdit,
    activeLink: state.activeLink,
    image_underlay: state.image_underlay,
    image_edited: state.image_edited,
    image_accepted: state.image_accepted
  };
};

// =============================================================================================================== Component connection to the store
let Edit_Link = connect(stp)(U_Edit_Link);
export default Edit_Link;
