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
            vehicleId: this.props.vehicleId,
            routeId: null,
            date: null,
            startReading: 0,
            endReading: 0,
            totalReading: 0,
            totalCost: 0,
            paid: 0,
            pending: 0,
        };
    }

    getCurrentBalance() {}

    handleAddSubmit(e) {
        e.preventDefault();
        let url = API_URL;
        let pending = this.state.totalCost - this.state.paid;

        const query = `INSERT INTO vehicleLedger(vehicleId, routeId, startReading, endReading, totalReading, totalCost, paid, pending) VALUES(${this.state.vehicleId}, '${this.state.routeId}', ${this.state.startReading}, ${this.state.endReading}, ${this.state.totalReading}, ${this.state.totalCost}, ${this.state.paid}, ${pending});`;

        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                console.log("ledger record added successfully");
                toast.success("record added successfully");
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
                            id="route"
                            label="Route"
                            variant="outlined"
                            type="text"
                            className="mr-2"
                            required={true}
                            size="small"
                            onChange={(e) =>
                                this.setState({ routeId: e.target.value })
                            }
                        />

                        <TextField
                            id="startReading"
                            label="Start Reading"
                            variant="outlined"
                            type="number"
                            className="mr-2"
                            size="small"
                            style={{ width: 150 }}
                            onChange={(e) =>
                                this.setState({ startReading: e.target.value })
                            }
                        />
                        <TextField
                            id="endReading"
                            label="End Reading"
                            variant="outlined"
                            className="mr-2"
                            type="number"
                            size="small"
                            style={{ width: 150 }}
                            onChange={(e) =>
                                this.setState({ endReading: e.target.value })
                            }
                        />

                        <TextField
                            id="totalReading"
                            label="total Reading"
                            variant="outlined"
                            className="mr-2"
                            type="number"
                            size="small"
                            style={{ width: 150 }}
                            onChange={(e) =>
                                this.setState({ totalReading: e.target.value })
                            }
                        />

                        <TextField
                            id="totalCost"
                            label="total Cost"
                            variant="outlined"
                            className="mr-2"
                            type="number"
                            size="small"
                            style={{ width: 150 }}
                            onChange={(e) =>
                                this.setState({ totalCost: e.target.value })
                            }
                        />

                        <TextField
                            id="paid"
                            label="Paid"
                            variant="outlined"
                            className="mr-2"
                            type="number"
                            size="small"
                            style={{ width: 150 }}
                            onChange={(e) =>
                                this.setState({ paid: e.target.value })
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
