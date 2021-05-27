import { FC, lazy, Suspense } from 'react';
import Container from 'react-bootstrap/Container';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Header } from './components/Header';
import { AuthenticationProvider } from './contexts/AuthenticationContext';
import { MainPage } from './pages/MainPage';
import './App.css';

const AccountPage = lazy(() => import('./pages/AccountPage'));
const ContestEditPage = lazy(() => import('./pages/ContestEditPage'));
const ContestPage = lazy(
  () => import(/* webpackPrefetch: true */ './pages/ContestPage')
);
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const RankingPage = lazy(() => import('./pages/RankingPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
export const App: FC = () => {
  return (
    <Router>
      <AuthenticationProvider>
        <Header />
        <Container className="App-container p-3">
          <Suspense fallback="loading">
            <Switch>
              <Route exact key="/" path="/" component={MainPage} />
              <Route exact key="/login" path="/login" component={LoginPage} />
              <Route
                exact
                key="/signup"
                path="/signup"
                component={SignUpPage}
              />
              <Route
                exact
                key="/ranking"
                path="/ranking"
                component={RankingPage}
              />
              <Route
                exact
                key="/account"
                path="/account/:id"
                component={AccountPage}
              />
              <Route
                exact
                key="/contest"
                path="/contest/:contestId"
                component={ContestPage}
              />
              <Route
                exact
                key="/contestEdit"
                path="/contest/:contestId/edit"
                component={ContestEditPage}
              />
              <Route component={NotFoundPage} />
            </Switch>
          </Suspense>
        </Container>
      </AuthenticationProvider>
    </Router>
  );
};
