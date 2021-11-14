import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";

// material UI imports
import {
    AppBar,
    Tab,
    Button,
    TextField,
    InputLabel,
    MenuItem,
    Select,
    FormControl,
} from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import { Row, Col, Button as Btn1, Modal, Badge } from "react-bootstrap";

// font awasome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPenAlt,
    faBook,
    faTrash,
    faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";

// Toastify imports
import { ToastContainer, toast } from "react-toastify";
// import "../ledger_manager/exportManager/node_modules/react-toastify/dist/ReactToastify.css";

//API handling components
import { API_URL } from "./../../global";

// import child components
import RetailerPartyManager from "./RetailerPartyManager";
import WholesellerPartyManager from "./WholesellerPartyManager";
import CustomerPartyManager from "./CustomerPartyManager";

// datatable setup
import jsZip from "jszip";
window.JSZip = jsZip;
var $ = require("jquery");
$.DataTable = require("datatables.net");
require("datatables.net-bs4");
require("datatables.net-autofill-bs4");
require("datatables.net-buttons-bs4");
require("datatables.net-buttons/js/buttons.colVis");
require("datatables.net-buttons/js/buttons.flash");
require("datatables.net-buttons/js/buttons.html5");
require("datatables.net-buttons/js/buttons.print");
require("datatables.net-responsive-bs4");
require("datatables.net-scroller-bs4");
require("datatables.net-select-bs4");
require("pdfmake");

// constants
const axios = require("axios");

class PartyManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddModal: false,
            showUpdateModel: false,
            value: "1",
            activePartyId: "",
            activePartyName: "",
            activePartyMobile: "",
            activePartyAddress: "",
            activePartyType: 1,
            partiesData: null,
        };
    }

    fetchPartiesData() {
        let url = API_URL;
        const query = `SELECT * FROM partyView WHERE status=1`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("party data: ", res.data);
                this.setState({ partiesData: res.data });
            })
            .catch((err) => {
                console.log("party data error: ", err);
            });
    }

    handleUpdateSubmit(e) {
        e.preventDefault();
        let url = API_URL;

        const query = `UPDATE party SET name="${this.state.activePartyName}", mobile="${this.state.activePartyMobile}", address="${this.state.activePartyAddress}", type=${this.state.activePartyType} WHERE id=${this.state.activePartyId};`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                toast.success("Party details updated successfully");
                this.fetchPartiesData();
            })
            .catch((err) => {
                console.log("error while updating party data", err);
            });
    }

    handleAddSubmit(e) {
        e.preventDefault();
        let url = API_URL;

        const query = `INSERT INTO party(name, mobile, address, type) VALUES('${this.state.activePartyName}', '${this.state.activePartyMobile}', '${this.state.activePartyAddress}', ${this.state.activePartyType})`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                toast.success("party details added successfully");
                setTimeout(() => {
                    this.refreshParties();
                }, 2000);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    deleteRecord(id) {
        let url = API_URL;
        const query = `UPDATE party SET status = 0  WHERE id=${id};`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("deleted status data: ", res.data);
                console.log("Party deleted successfully");
                toast.error("Party deleted successfully");
                setTimeout(() => {
                    this.refreshParties();
                }, 2000);
            })
            .catch((err) => {
                console.log("record delete error: ", err);
            });
    }

    handleTabs = (event, newValue) => {
        this.setState({ value: newValue });
    };

    refreshParties() {
        window.location.reload(false);
    }

    componentDidMount() {
        this.fetchPartiesData();
    }

    componentDidUpdate() {
        $("#party_table").DataTable({
            destroy: true,
            keys: true,
            buttons: [
                "copy",
                "csv",
                "excel",
                {
                    extend: "pdf",
                    messageTop: "<h4 style='text-align:center'>Users List</h4>",
                    download: "open",
                },
                {
                    extend: "print",
                    messageTop: "<h4 style='text-align:center'>Users List</h4>",
                    download: "open",
                },
            ],
        });
    }

    renderPartiesData = () => {
        const parties = this.state.partiesData;

        if (parties == null) {
            return null;
        }

        return parties.map((party) => {
            return (
                <tr>
                    <td align="center">
                        <Badge variant="primary">{party["id"]}</Badge>{" "}
                    </td>
                    <td align="center">{party["name"]}</td>
                    <td align="center">
                        <a href={"tel:" + party["mobile"]}>
                            <Button
                                className="mx-1"
                                color="primary"
                                variant="secondary"
                            >
                                {party["mobile"]}
                            </Button>
                        </a>
                    </td>
                    <td align="center">{party["address"]}</td>
                    <td align="center">
                        {party["type"] === 1
                            ? "Retailer"
                            : party["type"] === 1
                            ? "Wholeseller"
                            : "Customer"}
                    </td>
                    <td align="center">
                        {party["balance"] == null ? 0 : party["balance"]}
                    </td>
                    <td align="center">
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={(e) => {
                                this.setState({
                                    activePartyId: party["id"],
                                    activePartyName: party["name"],
                                    activePartyMobile: party["mobile"],
                                    activePartyAddress: party["address"],
                                    activePartyType: party["type"],
                                    showUpdateModal: true,
                                });
                            }}
                        >
                            <FontAwesomeIcon icon={faPenAlt} />
                        </Button>
                        <Link to={`ledgerManager/${party["id"]}`}>
                            <Button
                                className="mx-1"
                                color="primary"
                                variant="contained"
                                onClick={(e) => {}}
                            >
                                <FontAwesomeIcon icon={faBook} />
                            </Button>
                        </Link>
                        <Button
                            className="mx-1"
                            color="danger"
                            variant="contained"
                            onClick={(e) => {
                                if (window.confirm("Delete the item?")) {
                                    this.deleteRecord(party["id"]);
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </td>
                </tr>
            );
        });
    };

    renderUpdatePartyModal() {
        return (
            <Modal
                show={this.state.showUpdateModal}
                onHide={(e) => this.setState({ showUpdateModal: false })}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Update Party
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form noValidate autoComplete="off">
                        <div className="mt-3">
                            <Row>
                                <Col size="12">
                                    <TextField
                                        id="partyName"
                                        label="Party name"
                                        variant="outlined"
                                        className="m-2"
                                        defaultValue={
                                            this.state.activePartyName
                                        }
                                        onChange={(e) => {
                                            this.setState({
                                                activePartyName: e.target.value,
                                            });
                                        }}
                                    />
                                </Col>
                                <Col>
                                    <TextField
                                        id="mobile"
                                        label="Mobile"
                                        variant="outlined"
                                        className="m-2"
                                        defaultValue={
                                            this.state.activePartyMobile
                                        }
                                        onChange={(e) =>
                                            this.setState({
                                                activePartyMobile:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <TextField
                                        id="address"
                                        s
                                        label="Address"
                                        variant="outlined"
                                        className="m-2"
                                        defaultValue={
                                            this.state.activePartyAddress
                                        }
                                        onChange={(e) =>
                                            this.setState({
                                                activePartyAddress:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                                <Col>
                                    <FormControl
                                        variant="filled"
                                        style={{
                                            minWidth: "120px",
                                        }}
                                        className="mt-2 ml-2"
                                    >
                                        <InputLabel id="demo-simple-select-outlined-label">
                                            Type
                                        </InputLabel>
                                        <Select
                                            labelId="demo-simple-select-outlined-label"
                                            id="demo-simple-select-outlined"
                                            label="type"
                                            defaultValue={
                                                this.state.activePartyType
                                            }
                                            onChange={(e) =>
                                                this.setState({
                                                    activePartyType:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <MenuItem value={1}>
                                                Retailer
                                            </MenuItem>
                                            <MenuItem value={2}>
                                                Wholeseller
                                            </MenuItem>
                                            <MenuItem value={3}>
                                                Customer
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Col>
                            </Row>
                        </div>
                        <hr />
                        <div className="mt-2 mr-1">
                            <Btn1
                                style={{ float: "right" }}
                                onClick={(e) => {
                                    this.setState({
                                        showUpdateModal: false,
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
        );
    }
    render() {
        return (
            <TabContext
                value={this.state.value}
                className="container-fluid border m-0 p-0 main"
            >
                <AppBar position="static" color="default">
                    <TabList
                        onChange={this.handleTabs}
                        aria-label="simple tabs example"
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab label="Parties" value="1" />
                        <Tab label="Retailers" value="2" />
                        <Tab label="Wholeseller" value="3" />
                        <Tab label="Customer" value="4" />
                    </TabList>
                </AppBar>
                <TabPanel value="1" className="m-0 p-0">
                    <div className="container-fluid border m-0 p-1">
                        <div
                            className="btn-group"
                            role="group"
                            aria-label="Basic example"
                        >
                            <Button
                                className="mt-1 mr-1 mb-3"
                                color="primary"
                                variant="contained"
                                onClick={(e) => {
                                    this.setState({ showAddModal: true });
                                }}
                            >
                                add new party
                            </Button>
                            <Button
                                color="primary"
                                variant="contained"
                                className="mt-1 mr-1 mb-3 ml-5"
                                onClick={this.refreshParties}
                            >
                                <FontAwesomeIcon icon={faSyncAlt} size="2x" />
                            </Button>
                        </div>

                        {this.renderUpdatePartyModal()}
                        <Modal
                            show={this.state.showAddModal}
                            onHide={(e) =>
                                this.setState({ showAddModal: false })
                            }
                            size="md"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="contained-modal-title-vcenter">
                                    Add New Party
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <form noValidate autoComplete="off">
                                    <div className="mt-3">
                                        <Row>
                                            <Col size="12">
                                                <TextField
                                                    id="partyName"
                                                    label="Party name"
                                                    variant="outlined"
                                                    className="m-2"
                                                    defaultValue=""
                                                    onChange={(e) => {
                                                        this.setState({
                                                            activePartyName:
                                                                e.target.value,
                                                        });
                                                    }}
                                                />
                                            </Col>
                                            <Col>
                                                <TextField
                                                    id="mobile"
                                                    label="Mobile"
                                                    variant="outlined"
                                                    className="m-2"
                                                    defaultValue=""
                                                    onChange={(e) =>
                                                        this.setState({
                                                            activePartyMobile:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <TextField
                                                    id="address"
                                                    s
                                                    label="Address"
                                                    variant="outlined"
                                                    className="m-2"
                                                    defaultValue=""
                                                    onChange={(e) =>
                                                        this.setState({
                                                            activePartyAddress:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            </Col>
                                            <Col>
                                                <FormControl
                                                    variant="filled"
                                                    style={{
                                                        minWidth: "120px",
                                                    }}
                                                    className="mt-2 ml-2"
                                                >
                                                    <InputLabel id="demo-simple-select-outlined-label">
                                                        Type
                                                    </InputLabel>
                                                    <Select
                                                        labelId="demo-simple-select-outlined-label"
                                                        id="demo-simple-select-outlined"
                                                        label="type"
                                                        defaultValue={1}
                                                        onChange={(e) =>
                                                            this.setState({
                                                                activePartyType:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    >
                                                        <MenuItem value={1}>
                                                            Retialer
                                                        </MenuItem>
                                                        <MenuItem value={2}>
                                                            Wholeseller
                                                        </MenuItem>
                                                        <MenuItem value={3}>
                                                            Customer
                                                        </MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Col>
                                        </Row>
                                    </div>
                                    <hr />
                                    <div className="mt-2 mr-1">
                                        <Btn1
                                            style={{ float: "right" }}
                                            onClick={(e) => {
                                                this.setState({
                                                    showAddModal: false,
                                                });
                                                this.handleAddSubmit(e);
                                            }}
                                        >
                                            Add
                                        </Btn1>
                                    </div>
                                </form>
                            </Modal.Body>
                        </Modal>
                        <Row className="ml-0 mr-0">
                            <Col md="12" className="p-0 m-0 measure1">
                                <div>
                                    <table
                                        id="party_table"
                                        className="display"
                                        style={{ width: "100%" }}
                                    >
                                        <thead>
                                            <tr align="center">
                                                <th>Party Id</th>
                                                <th>Name</th>
                                                <th>Mobile No</th>
                                                <th>Address</th>
                                                <th>Type</th>
                                                <th>Balance</th>
                                                <th>Options</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.renderPartiesData()}
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </TabPanel>
                <TabPanel value="2" className="m-0 p-0">
                    <RetailerPartyManager />
                </TabPanel>
                <TabPanel value="3" className="m-0 p-0">
                    <WholesellerPartyManager />
                </TabPanel>
                <TabPanel value="4" className="m-0 p-0">
                    <CustomerPartyManager />
                </TabPanel>

                <ToastContainer
                    position={toast.POSITION.TOP_RIGHT}
                    autoClose={5000}
                />
            </TabContext>
        );
    }
}

export default PartyManager;
