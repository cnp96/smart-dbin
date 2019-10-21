import * as React from "react";

export interface AlertProps {
  header?: string;
  message: string;
  type: "success" | "error";
}

const Alert: React.FC<AlertProps> = props => {
  const type = props.type === "error" ? "danger" : "success";
  return (
    <div
      className={`alert alert-${type} alert-dismissible fade show`}
      role="alert"
    >
      {props.header && <strong>{props.header}</strong>} {props.message}
      {/* <button
        type="button"
        className="close"
        data-dismiss="alert"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button> */}
    </div>
  );
};

export default Alert;
