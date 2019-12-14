import ReactDOM from "react-dom";
import React from "react";
import { Provider } from "react-redux";
import store from "./store.js";
import App from "./App.jsx";

// ================================ CSS
import "./quill.css";
import "react-image-crop/dist/ReactCrop.css";
import "./BookMarker.css";

import reloadMagic from "./reload-magic-client.js"; // automatic reload
reloadMagic(); // automatic reload

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
