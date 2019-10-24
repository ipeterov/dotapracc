import React from "react";
import ReactDOM from "react-dom";

import 'react-bulma-components/dist/react-bulma-components.min.css';
import { Button } from 'react-bulma-components';


console.log(Button);

const App = () => (
    <Button color="primary">My Bulma button</Button>
);


ReactDOM.render(<App />, document.getElementById("app"));
