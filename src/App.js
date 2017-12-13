import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Map } from 'immutable';
import { GlobalNav } from '@r29/dash-global-nav/dist/dash-global-nav';
import Results from './Results';
import Configure from './Configure';

import './App.css';

const App = ({ user }) => (
  <Router>
    <main>
      <GlobalNav user={Map()} />
      <section className="container">
        <Route path="/ab" component={Results} exact />
        <Route path="/ab/configure" component={Configure} exact />
      </section>
    </main>
  </Router>
);

export default App;
