import React from "react";
import "./App.scss";
import Routes from "../../routes";
import { BrowserRouter } from "react-router-dom";

export interface AppProps {}

export interface AppState {}

class App extends React.Component<AppProps, AppState> {
  render() {
    return (
      <div className="container">
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
