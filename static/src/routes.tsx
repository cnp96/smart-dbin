import * as React from "react";
import { Switch, Route, Redirect, Link } from "react-router-dom";
import SendOTP from "./components/SendOTP";

export interface RoutesProps {}

const Routes: React.SFC<RoutesProps> = () => {
  return (
    <Switch>
      <Route
        exact
        path="/"
        component={() => (
          <div className="jumbotron">
            <h1 className="display-4">Smart Bin!</h1>
            <p className="lead">Uh oh!</p>
            <hr className="my-4" />
            <p>
              Looks like you've landed on the default page. Please scan the QR
              code available near any dustbin to access the portal.
            </p>
            <Link
              to="/verify?bin=dustbin1"
              className="btn btn-primary btn-lg"
              role="button"
            >
              Create Account
            </Link>
          </div>
        )}
      />
      <Route
        exact
        path="/verify"
        render={props => {
          const params = new URLSearchParams(props.location.search);
          if (params.get("bin")) return <SendOTP />;
          else props.history.push("/");
        }}
      />
      <Redirect to="/" />
    </Switch>
  );
};

export default Routes;
