import * as React from "react";
import Alert from "../Alert";
import Axios from "axios";

export interface CheckRewardProps {}

export interface CheckRewardState {
  alert: {
    type: "success" | "error";
    message: string;
  };
  mobile: string;
  loading: boolean;
  rewards: string;
  getRewardLabel: string;
}

class CheckReward extends React.Component<CheckRewardProps, CheckRewardState> {
  constructor(props: CheckRewardProps) {
    super(props);
    this.state = {
      alert: {
        type: "success",
        message: ""
      },
      mobile: "",
      loading: false,
      rewards: "",
      getRewardLabel: "Check Reward Points"
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

  onMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/ /g, "");
    if (isNaN(Number(val))) return;
    if (val.length > 10) return;
    this.setState({ mobile: val });
  };

  _isValidMobile(mob: string) {
    return !isNaN(Number(mob)) && mob.length === 10;
  }

  getRewardPoints = () => {
    const mobile = this.state.mobile.trim();
    if (this._isValidMobile(mobile)) {
      this.setState({ loading: true, getRewardLabel: "Please wait..." }, () => {
        Axios.get(`${window.location.origin}/api/user/reward/${mobile}`)
          .then(r => r.data)
          .then(res => {
            if (!res.status) {
              this.setState({
                loading: false,
                getRewardLabel: "Check Reward Points",
                rewards: res.reward
              });
            } else {
              this.setState({
                loading: false,
                getRewardLabel: "Check Reward Points",
                alert: { type: "error", message: res.message }
              });
            }
          })
          .catch(e => {
            this.setState({
              loading: false,
              getRewardLabel: "Check Reward Points",
              alert: {
                type: "error",
                message: e.message
              }
            });
          });
      });
    } else {
      this.setState({
        alert: {
          type: "error",
          message: "Invalid mobile!"
        }
      });
    }
  };

  render() {
    const { alert, loading } = this.state;

    return (
      <div className="form">
        <h4>Check Reward Points</h4>
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
            onKeyUp={e => (e.keyCode === 13 ? this.getRewardPoints() : null)}
            disabled={loading}
          />
        </div>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="0"
            aria-label="Reward points"
            aria-describedby="Reward points"
            value={this.state.rewards}
            onChange={() => {}}
            disabled={true}
          />
        </div>
        <button
          type="button"
          disabled={loading}
          className={`btn btn-${loading ? "secondary" : "primary"}`}
          onClick={this.getRewardPoints}
        >
          {this.state.getRewardLabel}
        </button>
      </div>
    );
  }
}

export default CheckReward;
