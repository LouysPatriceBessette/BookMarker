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

// =============================================================================================================== Component class
class U_Bot extends Component {
  constructor(props) {
    super(props);

    this.bot_messages = [
      "Hello new user!\n I hope you are happy with your new Bookmarker account.",
      "First!! You have a context menu! Try the mouse right-click now.",
      "As you can see... That menu is different when you click over a link.",
      "Try adding a folder.",
      "Now a link.",
      "There you go!\nSo that's your user menu to manage everything.",
      "Click me on if you need more help ;)"
    ];
    this.timing = [4000, 6000, 18000, 27000, 35000, 42000, 53000];
    this.chatbox_appear_delay = 1800;
    this.chatbox_shutoff_Delay = 3000;
    this.bot_is_typing_string = "Bot is typing...";
    this.bot_is_typing_delay = 1500;
    this.bot_output = 300;
    this.bot_msg_counter = 0;
    this.bot_timing = null;
  }

  // =============================================================================================================== Component functions

  // =============================================================================================================== Component render

  bot_message_timing = () => {
    //
    // Just initiating...
    //
    setTimeout(() => {
      let chatbox = document.querySelector(".BotContainer");
      let chatWindow_inner = document.querySelector(".chatWindow_inner");
      let botStatus = document.querySelector(".BotStatus");

      let bot_animation_done = false;
      let load_time = new Date().getTime();

      // Chat box appears
      setTimeout(() => {
        chatbox.style.opacity = 1;
      }, this.chatbox_appear_delay);

      setTimeout(() => {
        chatbox.style.opacity = 0;
      }, this.chatbox_appear_delay + this.timing[this.timing.length - 1] + this.chatbox_shutoff_Delay);

      log.ok("Interval started");
      clearInterval(this.bot_timing);
      this.bot_timing = setInterval(() => {
        //log.ok("Interval runs...");
        let now = new Date().getTime();

        if (now > load_time + this.timing[this.bot_msg_counter]) {
          // BOT typing
          //log.error("BOT typing...");
          botStatus.innerText = this.bot_is_typing_string;

          // Clear Bot is typing
          setTimeout(() => {
            botStatus.innerText = "";
          }, this.bot_is_typing_delay);

          // Bot Message output
          setTimeout(() => {
            //log.ok("BOT output");

            chatWindow_inner.innerText +=
              "\n\n" + this.bot_messages[this.bot_msg_counter - 1];
          }, this.bot_is_typing_delay + this.bot_output);

          // Increment messages count
          setTimeout(() => {
            this.bot_msg_counter++;
          }, 1);
        }

        // ===========

        // Clear
        if (this.bot_msg_counter > this.timing.length - 1) {
          clearInterval(this.bot_timing);
          log.error("Interval cleared");
        }
      }, 100);
    }, 1);
  };

  render = () => {
    log.render("Bot");

    // ======================================================================= Return
    if (this.props.history.length === 0) {
      return (
        <>
          <div className="BotContainer">
            <div className="chatWindow">
              <div className="chatContent">
                <div className="chatWindow_inner">
                  {this.bot_message_timing()}
                </div>
              </div>
              <div className="BotStatus"></div>
            </div>
          </div>
        </>
      ); // ==================================================================== End return
    } else {
      return <></>; // ==================================================================== End return
    }
  }; // End render
} // End class

// =============================================================================================================== State to Props
let stp = state => {
  return {
    history: state.history
  };
};

// =============================================================================================================== Component connection to the store
let Bot = connect(stp)(U_Bot);
export default Bot;
