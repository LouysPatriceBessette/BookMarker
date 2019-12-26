// content.js
console.log("========================== The BookMarker Extention is running ==========================")

// made from a tutorial: https://thoughtbot.com/blog/how-to-make-a-chrome-extension



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    
    let tabURL;
    let onBookmarker = false;
    let userLogged = false;
    
    if( request.message === "extention icon clicked" ) {
      
      //Check if wwe are on Bookmarker.club or another page
      chrome.runtime.sendMessage({"message": "check tab url"}, function(response) {
        console.log(JSON.stringify(response))
        tabURL = response.tabUrl
        
        if(tabURL==="http://localhost:4000/"){
          console.log("On Bookmarker.club");
          onBookmarker = true;
        }else{
          console.log("On another page")
          
          // If NOT on Bookmarker.club... Focus it or open it in another tab.
          chrome.runtime.sendMessage({"message": "check for bookmarker opened"});
          
        } // END if tabUrl === bookmarker.club
        
        // If on Bookmarker, check if logged
        if(onBookmarker){
          // Loop throught all SVG element to find one having the logged class
          document.querySelectorAll("svg.logged").forEach(svg => {          
              userLogged = true
              console.log("User is logged");
          })
          if(!userLogged){
            console.log("User is not logged")
          }
          
          // If not on Bookmarker.club, open it in a tab
        }else{
          // Tab open
        //chrome.runtime.sendMessage({"message": "open_new_tab", "url": "http://localhost:4000/"});
        }
      });

    }
  }
);