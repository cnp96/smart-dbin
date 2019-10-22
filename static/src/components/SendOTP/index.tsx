import * as React from "react";
import axios from "axios";
import Alert from "../Alert";

export interface SendOTPProps {}
export interface SendOTPState {
  mobile: string;
  sendingOTP: boolean;
  sendLabel: string;
  alert: {
    type: "success" | "error";
    message: string;
  };
  verify: boolean;
  otp: string;
  verifyingOTP: boolean;
  verifyLabel: string;
}

class SendOTP extends React.Component<SendOTPProps, SendOTPState> {
  constructor(props: SendOTPProps) {
    super(props);
    this.state = {
      mobile: "",
      sendingOTP: false,
      sendLabel: "Send OTP",
      alert: { type: "success", message: "" },
      verify: false,
      otp: "",
      verifyingOTP: false,
      verifyLabel: "Verify OTP"
    };
  }

  private interval: any;
  componentDidMount() {
    this.interval = setInterval(() => {
      if (this.state.alert.message) {
        setTimeout(
          () => this.setState({ alert: { type: "success", message: "" } }),
          2000
        );
      }
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  _isValidMobile(mob: string) {
    return !isNaN(Number(mob)) && mob.length === 10;
  }

  onMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/ /g, "");
    if (isNaN(Number(val))) return;
    if (val.length > 10) return;
    this.setState({ mobile: val });
  };

  onOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/ /g, "");
    this.setState({ otp: val });
  };

  sendOTP = () => {
    if (!this.state.sendingOTP && this._isValidMobile(this.state.mobile)) {
      const params = new URLSearchParams(window.location.search);
      const dustbin = params.get("bin");
      this.setState({ sendingOTP: true, sendLabel: "Please wait..." }, () => {
        axios
          .post(`${window.location.origin}/api/create/otp`, {
            dustbin,
            mobile: this.state.mobile
          })
          .then(res => res.data)
          .then(res => {
            if (!res.data) {
              this.setState({
                sendingOTP: false,
                sendLabel: "Send OTP",
                alert: {
                  type: "error",
                  message: "Some error occurred. Please try again."
                }
              });
            } else {
              this.setState({
                sendingOTP: false,
                sendLabel: "Resend OTP",
                verify: true,
                verifyLabel: "Verify OTP",
                alert: {
                  type: "success",
                  message: `An OTP has been sent to ${res.data.mobile}!`
                }
              });
            }
          })
          .catch(err => {
            this.setState({
              sendingOTP: false,
              sendLabel: "Resend OTP",
              alert: { type: "error", message: err.message }
            });
          });
      });
    } else {
      this.setState({
        alert: {
          type: "error",
          message: "Please enter a valid mobile number!"
        }
      });
    }
  };

  verifyOTP = () => {
    const { otp, mobile } = this.state;
    if (!otp) {
      this.setState({ alert: { type: "error", message: "Invalid OTP" } });
    } else {
      const params = new URLSearchParams(window.location.search);
      const dustbin = params.get("bin");
      this.setState(
        { verifyLabel: "Please wait...", verifyingOTP: true },
        () => {
          axios
            .get(
              `${window.location.origin}/api/verify/otp/${dustbin}/${mobile}/${otp}`
            )
            .then(res => res.data)
            .then(res => {
              if (res.data) {
                this.setState({
                  verify: false,
                  verifyLabel: "Verify OTP",
                  verifyingOTP: false,
                  mobile: "",
                  otp: "",
                  sendLabel: "Send OTP",
                  alert: {
                    type: "success",
                    message: res.data
                  }
                });
              } else {
                this.setState({
                  verifyingOTP: false,
                  verifyLabel: "Verify OTP",
                  sendLabel: "Resend OTP",
                  otp: "",
                  alert: {
                    type: "error",
                    message: res.message
                  }
                });
              }
            })
            .catch(e => {});
        }
      );
    }
  };

  render() {
    const { alert, sendingOTP, verify, verifyingOTP } = this.state;

    return (
      <div className="form">
        <h4>Verify Yourself</h4>
        {alert.message && <Alert message={alert.message} type={alert.type} />}
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter mobile number"
            aria-label="Mobile Number"
            aria-describedby="Mobile Number"
            value={this.state.mobile}
            onChange={this.onMobileChange}
            onKeyUp={e => (e.keyCode === 13 ? this.sendOTP() : null)}
            disabled={verify || sendingOTP || verifyingOTP}
          />
        </div>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter OTP"
            aria-label="OTP"
            aria-describedby="One time password"
            value={this.state.otp}
            onChange={this.onOTPChange}
            onKeyUp={e => (e.keyCode === 13 ? this.verifyOTP() : null)}
            disabled={!verify || verifyingOTP}
          />
        </div>
        <button
          type="button"
          disabled={sendingOTP || verifyingOTP}
          className={`btn btn-${sendingOTP ? "secondary" : "primary"}`}
          onClick={this.sendOTP}
        >
          {this.state.sendLabel}
        </button>
        <button
          type="button"
          disabled={!verify || verifyingOTP}
          className={`mr-2 btn btn-${verifyingOTP ? "secondary" : "primary"}`}
          onClick={this.verifyOTP}
        >
          {this.state.verifyLabel}
        </button>
      </div>
    );
  }
}

export default SendOTP;
