import { StrictMode, FC, lazy, Suspense } from 'react';
import Container from 'react-bootstrap/Container';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { AuthenticationProvider } from './contexts/AuthenticationContext';
import { MainPage } from './pages/MainPage';
import './App.css';
import { PolicyPage } from './pages/PolicyPage';
import { TermsPage } from './pages/TermsPage';

const AccountPage = lazy(() => import(`./pages/AccountPage/index`));
const ContestEditPage = lazy(() => import('./pages/ContestEditPage'));
const ContestPage = lazy(
  () => import(/* webpackPrefetch: true */ `./pages/ContestPage/index`)
);
const LoginPage = lazy(() => import('./pages/LoginPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const RankingPage = lazy(() => import('./pages/RankingPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
export const App: FC = () => {
  return (
    <StrictMode>
      <Router>
        <AuthenticationProvider>
          <Header />
          <main>
            <Container className="App-container p-3">
              <Suspense fallback="loading">
                <Switch>
                  <Route exact key="/" path="/" component={MainPage} />
                  <Route
                    exact
                    key="/login"
                    path="/login"
                    component={LoginPage}
                  />
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
                  <Route
                    exact
                    key="/terms"
                    path="/terms"
                    component={TermsPage}
                  />
                  <Route
                    exact
                    key="/privacy-policy"
                    path="/privacy-policy"
                    component={PolicyPage}
                  />
                  <Route component={NotFoundPage} />
                </Switch>
              </Suspense>
            </Container>
          </main>
          <Footer />
        </AuthenticationProvider>
      </Router>
    </StrictMode>
  );
};
