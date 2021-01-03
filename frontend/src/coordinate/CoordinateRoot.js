import React from "react";
import { BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {CoordinatePage} from "./CoordinatePage";

// URL: /coordinate
export class CoordinateRoot extends React.Component {
  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route component={CoordinatePage} />
          </Switch>
        </Router>
      </div>
    );
  }
}