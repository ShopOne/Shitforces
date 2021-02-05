import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AccountPage from './AccountPage';
import { ContestPage } from './ContestPage';
import Header from './Header';
import LoginPage from './LoginPage';
import MainPage from './MainPage';
import NotFound from './NotFound';
import SignUpPage from './SignUpPage';

class Main extends React.Component {
  render() {
    return (
      <Router>
        <div>
          <Header />
          <Switch>
            <Route exact key={'/'} path={'/'} component={MainPage} />
            <Route exact key={'/login'} path={'/login'} component={LoginPage} />
            <Route
              exact
              key={'/signup'}
              path={'/signup'}
              component={SignUpPage}
            />
            <Route
              exact
              key={'/account'}
              path="/account/:id"
              component={AccountPage}
            />
            <Route
              exact
              key={'/contest'}
              path="/contest/:contestId"
              component={ContestPage}
            />
            <Route component={NotFound} />
          </Switch>
        </div>
      </Router>
    );
  }
}
ReactDOM.render(<Main />, document.getElementById('root'));
