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

    this.quill_editor = undefined;
    this.quill_opened = false;

    this.state = {
      link_rename: this.props.links[this.props.activeLink].name,
      renameFieldDisplayed: false
    };
  }

  // =============================================================================================================== Component functions

  changeRating = newRating => {
    // Save the rating in store
    this.props.dispatch({
      type: "change rating",
      activeLink: this.props.activeLink,
      rating: newRating
    });
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
        <div
          className="link_card shadowMove"
          key={key({ linkID: this.props.activeLink })}
          data-id={this.props.activeLink}
        >
          <span className="dragIcon" title="Drag me!"></span>
          <div className="link_title">
            <div
              id={"real_link_" + this.props.activeLink}
              className="link_name"
              title={link.name}
            >
              {link.name}
            </div>
          </div>
          <div className="link_img">
            <a target="_blank" href={link.href}>
              <img src={link.image} />
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
          <div className="Link_comment_Div">{linkComment}</div>
        </div>
      </>
    ); // ==================================================================== End return
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    // Specific component props from the state here
    links: state.links
  };
};

// =============================================================================================================== Component connection to the store
let Tabbed_Links = connect(stp)(U_Tabbed_Links);
export default Tabbed_Links;
