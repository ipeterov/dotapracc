import React from "react";
import ReactDOM from "react-dom";
import 'react-bulma-components/dist/react-bulma-components.min.css';

import HomePage from "./HomePage.jsx"


const App = () => (
    <HomePage />
);


ReactDOM.render(<App />, document.getElementById("app"));
