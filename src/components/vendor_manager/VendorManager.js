import React, { Component } from "react";
import "./style.css";
import {
    Table,
    TableBody,
    TableContainer,
    Button,
    TableHead,
    TableRow,
    TableCell,
    TextField,
    Paper,
} from "@material-ui/core";
import { Modal, Button as Btn1, Row, Col, Badge } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import moment from "moment";
import "react-toastify/dist/ReactToastify.css";

//API handling components
import { API_URL } from "./../../global";
const axios = require("axios");

export class VendorManager extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            vendorName: "",
            orderDate: null,
            description: "",
            paymentDate: null,
            amount: "",
            vendorData: {},
        };
    }
    getVendorData() {
        let url = API_URL + "/executeQuery";
        const query = `SELECT *  from vendorManager order by orderId DESC;`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                console.log(res.data);
                this.setState({ vendorData: res.data });
            })
            .catch((err) => {
                console.log(err);
            });
    }
    componentDidMount() {
        this.getVendorData();
    }
    handleSubmit(e, state) {
        e.preventDefault();
        let url = API_URL + "/executeQuery";
        const { vendorName, orderDate, description, paymentDate, amount } =
            state;
        const query = `INSERT INTO vendorManager (name,orderdate,description,paymentDate,amount) VALUES('${vendorName}','${orderDate}','${description}','${paymentDate}',${amount});`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                toast.warn("नवीन मालाचा तपशील सेव्ह करण्यात यशस्वी");
                this.getVendorData();
            })
            .catch((err) => {
                console.log(err);
            });
        this.setState({ show: false });
    }

    deleteRecord(orderId) {
        let url = API_URL + "/executeQuery";
        const query = `DELETE from vendorManager WHERE orderId=${orderId};`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                toast.success("Record deleted successfully");
                this.getVendorData();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    render() {
        return (
            <div className="container-fluid border m-0 p-1 main">
                <Button
                    color="primary"
                    variant="contained"
                    className="mt-1 mb-1"
                    onClick={(e) => this.setState({ show: true })}
                >
                    Add new vendor order
                </Button>
                <Modal
                    show={this.state.show}
                    onHide={(e) => this.setState({ show: false })}
                    size="md"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Add new vendor order
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form
                            noValidate
                            autoComplete="off"
                            onSubmit={(e) => {
                                this.setState({ show: false });
                                this.handleSubmit(e, this.state);
                            }}
                        >
                            <div className="mt-3">
                                <TextField
                                    id="vendorName"
                                    label="Vendor name"
                                    variant="outlined"
                                    className="mr-2"
                                    value={this.state.vendorName}
                                    onChange={(e) =>
                                        this.setState({
                                            vendorName: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    id="amount"
                                    label="Amount"
                                    variant="outlined"
                                    value={this.state.amount}
                                    onChange={(e) =>
                                        this.setState({
                                            amount: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="mt-3">
                                <Row>
                                    <Col md={6} className="mr-0 pr-0">
                                        <TextField
                                            id="orderDate"
                                            variant="outlined"
                                            className="mr-2"
                                            type="date"
                                            label="Order Date"
                                            style={{ minWidth: "14.7vw" }}
                                            value={this.state.orderDate}
                                            onChange={(e) =>
                                                this.setState({
                                                    orderDate: e.target.value,
                                                })
                                            }
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Col>
                                    <Col md={6} className="ml-0 pl-0">
                                        <TextField
                                            id="paymentDate"
                                            variant="outlined"
                                            type="date"
                                            label="Payment Date"
                                            style={{ minWidth: "15vw" }}
                                            value={this.state.paymentDate}
                                            onChange={(e) =>
                                                this.setState({
                                                    paymentDate: e.target.value,
                                                })
                                            }
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            <div className="mt-3">
                                <TextField
                                    id="description"
                                    label="Description"
                                    variant="outlined"
                                    value={this.state.description}
                                    style={{ minWidth: "30vw" }}
                                    onChange={(e) =>
                                        this.setState({
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="mt-2 mr-1">
                                <Btn1 style={{ float: "right" }} type="submit">
                                    Save
                                </Btn1>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
                <TableContainer component={Paper} style={{ maxHeight: "85vh" }}>
                    <Table
                        stickyHeader
                        size="medium"
                        aria-label="simple table"
                        component={Paper}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Order Id</TableCell>
                                <TableCell>Vendor name</TableCell>
                                <TableCell>Order date</TableCell>
                                <TableCell>Payment date</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Operation</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.vendorData.length > 0 ? (
                                this.state.vendorData.map((vendor) => {
                                    return (
                                        <TableRow key={vendor.vendorId}>
                                            <TableCell align="center">
                                                <Badge variant="primary">
                                                    {" "}
                                                    {vendor.orderId}
                                                </Badge>
                                            </TableCell>
                                            <TableCell
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {vendor.name}
                                            </TableCell>
                                            <TableCell>
                                                {moment(
                                                    vendor.orderDate
                                                ).format("ddd D MMMM YYYY")}
                                            </TableCell>
                                            <TableCell>
                                                {moment(
                                                    vendor.paymentDate
                                                ).format("ddd D MMMM YYYY")}
                                            </TableCell>
                                            <TableCell>
                                                {vendor.description}
                                            </TableCell>
                                            <TableCell>
                                                ₹ {vendor.amount}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    color="primary"
                                                    variant="contained"
                                                    className="mt-1 mb-1"
                                                    onClick={(e) => {
                                                        this.setState({
                                                            activeOrderId:
                                                                vendor.orderId,
                                                        });
                                                        this.setState({
                                                            showDeleteModal: true,
                                                        });
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTrash}
                                                    />
                                                </Button>
                                                <Modal
                                                    show={
                                                        this.state
                                                            .showDeleteModal
                                                    }
                                                    onHide={(e) =>
                                                        this.setState({
                                                            showDeleteModal: false,
                                                        })
                                                    }
                                                    size="md"
                                                    aria-labelledby="contained-modal-title-vcenter"
                                                    centered
                                                >
                                                    <Modal.Header closeButton>
                                                        <Modal.Title id="contained-modal-title-vcenter">
                                                            Delete vendor record
                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <p>
                                                            Do you really want
                                                            to delete this
                                                            vendor record?
                                                        </p>
                                                        <Button
                                                            color="danger"
                                                            variant="contained"
                                                            className="mt-1 mb-1"
                                                            onClick={() => {
                                                                this.deleteRecord(
                                                                    this.state
                                                                        .activeOrderId
                                                                );
                                                                this.setState({
                                                                    showDeleteModal: false,
                                                                });
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Modal.Body>
                                                </Modal>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell>No data found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <ToastContainer
                    position={toast.POSITION.TOP_RIGHT}
                    autoClose={3000}
                />
            </div>
        );
    }
}

export default VendorManager;
