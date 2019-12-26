// background.js

let BookmarkerUrl = "http://localhost:4000/"
let BookmarkerRoute = "http://localhost:4000/addLink/"
let activeTab;

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "extention icon clicked"});
  });
});

// onMessage listener
chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    
    // Open a new tab
    if( request.message === "open_new_tab" ) {
      
      // Open a new tab
      chrome.tabs.create({"url": request.url});
    }
    
    // Check the current active tab url
    if( request.message === "check tab url" ) {
      
      // Return the url
      sendResponse({"tabUrl": activeTab.url});
    }
    
    // Check if Boomarker tab is opened
    if( request.message === "check for bookmarker opened" ) {
      
      // Return a boolean
      //sendResponse({"BookmarkerOpened": await isBookmarkerOpened()});
      
      sendResponse({"test":"ok", "BookmarkerOpened": chrome.tabs.getAllInWindow(undefined, function(tabs) {
          
          // Find the Bookmarker tab if opened
          let BookmarkerTab = tabs.filter( function(tab){
            return tab.url === BookmarkerUrl
          })
          
          // From this SO answer: https://stackoverflow.com/a/4384923/2159528
          if(BookmarkerTab.length>0){
            chrome.tabs.update(BookmarkerTab[0].id, {selected: true});
          }else{
            // Prepare a link object to be sent as a wildcard
            let encoded_uri = encodeURI(activeTab.url).replace(/\//g,"~~").replace(/\?/g,"©©")
            let link_obj = {url:encoded_uri}
            let link_encoded_Obj = JSON.stringify(link_obj)
            
            chrome.tabs.create({url: BookmarkerRoute + link_encoded_Obj});
          }
          
          
        }) // END getAllInWindow
      
      }); // END sendResponse
    }
  }
);
