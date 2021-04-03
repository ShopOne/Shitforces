import React from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { AuthenticationProvider } from './contexts/AuthenticationContext';
import { AccountPage } from './pages/AccountPage';
import { ContestEditPage } from './pages/ContestEditPage';
import { ContestPage } from './pages/ContestPage';
import { LoginPage } from './pages/LoginPage';
import { MainPage } from './pages/MainPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RankingPage } from "./pages/RankingPage";
import { SignUpPage } from './pages/SignUpPage';
import './App.css';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthenticationProvider>
        <Header />
        <Container className='App-container p-3'>
          <Switch>
            <Route exact key='/' path='/' component={MainPage} />
            <Route exact key='/login' path='/login' component={LoginPage} />
            <Route exact key='/signup' path='/signup' component={SignUpPage} />
            <Route exact key='/ranking' path='/ranking' component={RankingPage}/>
            <Route
              exact
              key='/account'
              path='/account/:id'
              component={AccountPage}
            />
            <Route
              exact
              key='/contest'
              path='/contest/:contestId'
              component={ContestPage}
            />
            <Route
              exact
              key='/contestEdit'
              path='/contest/:contestId/edit'
              component={ContestEditPage}
            />
            <Route component={NotFoundPage} />
          </Switch>
        </Container>
      </AuthenticationProvider>
    </Router>
  );
};
