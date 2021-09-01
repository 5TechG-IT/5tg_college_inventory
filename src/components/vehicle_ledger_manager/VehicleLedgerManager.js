import React, { Component } from "react";

//Bootstrap and jQuery libraries
import "bootstrap/dist/css/bootstrap.min.css";
import "jquery/dist/jquery.min.js";
//Datatable Modules
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import $ from "jquery";

// styles
import "./style.css";
import "bootstrap/dist/css/bootstrap.css";

// material UI imports
import {
    TableBody,
    TableContainer,
    Button,
    Paper,
    TextField,
} from "@material-ui/core";
import { Row, Col, Button as Btn1, Modal, Badge } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

// Toastify imports
import { toast } from "react-toastify";

// import child components
import { AddNewEntry } from "./AddNewEntry.js";

//API handling components
import { API_URL } from "./../../global";
const axios = require("axios");

export default class VehicleLedgerManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vehicleId: this.props.match.params.vehicleId,
            showAddModal: false,
            showUpdateModel: false,
            activeRecordId: null,
            activePartyId: null,
            activeParticular: null,
            activeDebit: null,
            activeCredit: null,
            activeBalance: null,
            vehicleData: null,
            VehicleLedgerData: null,
            totalBalance: 0,
        };
    }

    fetchBalance() {
        // if party id is null
        if (!this.state.vehicleId) return null;

        let url = API_URL;
        const query = `SELECT (SUM(total) + SUM(debit) - SUM(credit)) as balance FROM ledger where party_id=${this.state.vehicleId};`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("party balance: ", res.data[0]["balance"]);
                this.setState({ totalBalance: res.data[0]["balance"] });
            })
            .catch((err) => {
                console.log("party data fetch error: ", err);
            });
    }

    fetchVehicleData() {
        // if party id is null
        if (!this.state.vehicleId) return null;

        let url = API_URL;
        const query = `SELECT * FROM vehicles WHERE id=${this.state.vehicleId};`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("vehicle data: ", res.data);
                this.setState({ vehicleData: res.data });
            })
            .catch((err) => {
                console.log("vehicle data fetch error: ", err);
            });
    }

    fetchVehicleLedgerData = () => {
        // if party id is null
        if (!this.state.vehicleId) return null;

        let url = API_URL;
        const query = `SELECT * FROM vehicleLedger WHERE vehicleId=${this.state.vehicleId};`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("vehicle ledger data: ", res.data);
                this.setState({ VehicleLedgerData: res.data });
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("ledger data fetch error: ", err);
            });
    };

    handleUpdateSubmit(e) {
        let url = API_URL;

        const query = `UPDATE ledger SET particular="${this.state.activeParticular}", debit="${this.state.activeDebit}", credit="${this.state.activeCredit}", balance="${this.state.activeBalance}" WHERE id=${this.state.activeRecordId};`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                toast.success("ledger details updated successfully");
                this.fetchVehicleLedgerData();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    refreshLedger() {
        window.location.reload(false);
    }

    componentDidMount() {
        this.fetchVehicleData();
        this.fetchVehicleLedgerData();
        this.fetchBalance();
    }

    renderPartyData = () => {
        const vehicle = this.state.vehicleData;
        if (!vehicle) return null;

        return (
            <div className="mb-2">
                <h5 className="float-left mt-2">
                    {vehicle[0]["id"]} | <b>{vehicle[0]["vehicleNo"]}</b>
                </h5>
            </div>
        );
    };
    renderVehicleLedgerData = () => {
        if (this.state.VehicleLedgerData == null) {
            return null;
        }

        const ledger = this.state.VehicleLedgerData;
        let last_modified = null;
        let balance = 0;

        return ledger.map((record) => {
            // extract date only
            last_modified = moment(record["last_modified"]).format(
                "DD / MM / YYYY HH:MM"
            );

            return (
                <tr>
                    <td align="center">
                        <Badge variant="primary">{record["id"]}</Badge>{" "}
                    </td>
                    <td align="center">{record["routeId"]}</td>
                    <td>{record["startReading"]}</td>
                    <td>{record["endReading"]}</td>
                    <td>{record["totalReading"]}</td>
                    <td>{record["totalCost"]}</td>
                    <td>{record["paid"]}</td>
                    <td>{record["pending"]}</td>
                    <td>{last_modified}</td>
                    <td align="center">
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={(e) => {
                                this.setState({
                                    activeRecordId: record.id,
                                    activeParticular: record.particular,
                                    activeDebit: record.debit,
                                    activeCredit: record.credit,
                                    activeBalance: balance,
                                });
                                this.setState({ showUpdateModel: true });
                            }}
                        >
                            <FontAwesomeIcon icon={faPenAlt} />
                        </Button>
                        <Modal
                            show={this.state.showUpdateModel}
                            onHide={(e) =>
                                this.setState({ showUpdateModel: false })
                            }
                            size="md"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="contained-modal-title-vcenter">
                                    Update record
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <form noValidate autoComplete="off">
                                    <div className="mt-3">
                                        <Row>
                                            <Col xs={12}>
                                                <TextField
                                                    id="pending"
                                                    label="Paid"
                                                    variant="outlined"
                                                    className="m-2"
                                                    defaultValue={
                                                        this.state
                                                            .activeParticular
                                                    }
                                                    onChange={(e) =>
                                                        this.setState({
                                                            activeParticular:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </Col>
                                        </Row>
                                    </div>

                                    <div className="mt-2 mr-1">
                                        <Btn1
                                            style={{ float: "right" }}
                                            onClick={(e) => {
                                                this.setState({
                                                    showUpdateModel: false,
                                                });
                                                this.handleUpdateSubmit(e);
                                            }}
                                        >
                                            Update
                                        </Btn1>
                                    </div>
                                </form>
                            </Modal.Body>
                        </Modal>
                    </td>
                </tr>
            );
        });
    };

    initializeDataTable() {
        $("#ledger_table").DataTable({
            destroy: true,
        });
    }

    render() {
        return (
            <div className="container-fluid border m-0 p-1">
                {this.renderPartyData()}
                <br />
                <hr />
                <div
                    class="btn-group mb-3"
                    role="group"
                    aria-label="Basic example"
                >
                    <AddNewEntry
                        vehicleId={this.state.vehicleId}
                        refreshLedger={() => this.refreshLedger()}
                        totalBalance={this.state.totalBalance}
                    />
                </div>

                <Row className="ml-0 mr-0">
                    <Col md="12" className="p-0 m-0 measure1">
                        <TableContainer
                            component={Paper}
                            style={{ maxHeight: "79vh" }}
                        >
                            <table
                                id="ledger_table"
                                class="display"
                                style={{ width: "100%" }}
                            >
                                <thead>
                                    <tr>
                                        <th align="center">ID</th>
                                        <th align="center">route Name</th>
                                        <th>strart reading</th>
                                        <th>end reading</th>
                                        <th>total reading</th>
                                        <th>total cost</th>
                                        <th>paid </th>
                                        <th>pending</th>
                                        <th>last modified</th>
                                        <th align="center">Options</th>
                                    </tr>
                                </thead>
                                <TableBody>
                                    {this.renderVehicleLedgerData()}
                                </TableBody>
                            </table>
                        </TableContainer>
                    </Col>
                </Row>
            </div>
        );
    }
}
