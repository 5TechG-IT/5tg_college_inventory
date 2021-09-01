import React, { Component } from "react";

import { TextField, Button } from "@material-ui/core";
// import { TabContext, TabList, TabPanel } from "@material-ui/lab";
// import { Row, Col, Card, Badge, Table as Tbl } from "react-bootstrap";
import "./style.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

import { ToastContainer, toast } from "react-toastify";

//API handling components
import { API_URL } from "./../../global";
const axios = require("axios");

export class AddNewEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            partyId: this.props.partyId,
            particular: null,
            total: 0,
            debit: 0,
            credit: 0,
            balance: 0,
        };
    }

    getCurrentBalance() {
        let url = API_URL;

        const query = `SELECT balance FROM ledger WHERE party_id=${this.state.partyId} ORDER BY id DESC LIMIT 1 `;

        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                console.log("ledger balance: ", res.data[0]["balance"]);
                this.setState({ balance: res.data[0]["balance"] });
                console.log("ledger balance fetched successfully");
            })
            .catch((err) => {
                console.log(err);
            });
    }

    handleAddSubmit(e) {
        e.preventDefault();
        let url = API_URL;
        this.state.balance =
            this.state.credit - this.state.debit + this.state.balance;
        const query = `INSERT INTO ledger(party_id, particular, debit, credit, balance) VALUES(${this.state.partyId}, '${this.state.particular}', ${this.state.debit}, ${this.state.credit}, ${this.state.balance});`;

        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                console.log("ledger record added successfully");
                toast.success("ledger record added successfully");
                this.props.refreshLedger();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    componentDidMount() {
        this.getCurrentBalance();
    }

    render() {
        return (
            <div className="row">
                <form autoComplete="off">
                    <div className="row ml-4 mt-4">
                        <TextField
                            id="particular"
                            label="particular"
                            variant="outlined"
                            type="text"
                            className="mr-2"
                            required={true}
                            size="small"
                            onChange={(e) =>
                                this.setState({ particular: e.target.value })
                            }
                        />

                        {/* <TextField
                            id="total"
                            label="Total"
                            variant="outlined"
                            type="number"
                            className="mr-2"
                            size="small"
                            onChange={(e) =>
                                this.setState({ total: e.target.value })
                            }
                        /> */}

                        <TextField
                            id="debit"
                            label="debit"
                            variant="outlined"
                            type="number"
                            className="mr-2"
                            size="small"
                            onChange={(e) =>
                                this.setState({ debit: e.target.value })
                            }
                        />
                        <TextField
                            id="credit"
                            label="credit"
                            variant="outlined"
                            className="mr-2"
                            type="number"
                            size="small"
                            onChange={(e) =>
                                this.setState({ credit: e.target.value })
                            }
                        />

                        <Button
                            color="primary"
                            variant="contained"
                            className=""
                            onClick={(e) => this.handleAddSubmit(e)}
                        >
                            <FontAwesomeIcon icon={faPlusCircle} size="2x" />
                        </Button>
                        <Button
                            color="secondary"
                            variant="contained"
                            className="ml-5"
                            onClick={this.props.refreshLedger}
                        >
                            <FontAwesomeIcon icon={faSyncAlt} size="2x" />
                        </Button>
                    </div>
                </form>
                <ToastContainer />
            </div>
        );
    }
}
