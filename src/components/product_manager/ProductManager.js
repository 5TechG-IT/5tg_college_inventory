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
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

// Toastify imports
import { toast } from "react-toastify";

// import child components
import { AddNewEntry } from "./AddNewEntry.js";

//API handling components
import { API_URL } from "./../../global";
const axios = require("axios");

export default class ProductManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showProudctUpdateModal: false,
            activeProductId: null,
            activeName: null,
            activeUnitPrice: null,
            activeQuantity: null,
            products: null,
        };
    }

    fetchProducts = () => {
        const query = `SELECT * FROM products where status=1`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                this.setState({ products: res.data });
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("data fetch error: ", err);
            });
    };

    handleUpdateSubmit(e) {
        const query = `UPDATE products SET name = '${this.state.activeName}', unitPrice = ${this.state.activeUnitPrice}, quantity=${this.state.activeQuantity}  WHERE id = ${this.state.activeProductId};`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("update status: ", res.data);
                toast.success("Record Updated successfully");
            })
            .catch((err) => {
                console.log("record update error: ", err);
            });
    }

    deleteProduct(id) {
        const query = `UPDATE products SET status = 0  WHERE id = ${id};`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("deleted status data: ", res.data);
                console.log("record deleted successfully");
                toast.error("Record deleted successfully");
            })
            .catch((err) => {
                console.log("record delete error: ", err);
            });
    }

    refreshLedger() {
        window.location.reload(false);
    }

    componentDidMount() {
        this.fetchProducts();
    }

    initializeDataTable() {
        $("#product_table").DataTable({
            destroy: true,
        });
    }

    renderUpdateModal = () => {
        return (
            <Modal
                show={this.state.showProudctUpdateModal}
                onHide={(e) => this.setState({ showProudctUpdateModal: false })}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Update Product
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form noValidate autoComplete="off">
                        <div className="mt-3">
                            <Row>
                                <Col xs={12}>
                                    <TextField
                                        id="pending"
                                        label="Name"
                                        variant="outlined"
                                        className="m-2"
                                        size="small"
                                        defaultValue={this.state.activeName}
                                        value={this.state.activeName}
                                        onChange={(e) =>
                                            this.setState({
                                                activePaid: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                                <Col xs={6}>
                                    <TextField
                                        id="unitPrice"
                                        label="Unit Price"
                                        variant="outlined"
                                        type="number"
                                        defaultValue={
                                            this.state.activeUnitPrice
                                        }
                                        className="m-2"
                                        size="small"
                                        onChange={(e) =>
                                            this.setState({
                                                activeUnitPrice: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                                <Col xs={6}>
                                    <TextField
                                        id="quantity"
                                        label="Quantity"
                                        variant="outlined"
                                        type="number"
                                        defaultValue={this.state.activeQuantity}
                                        className="m-2"
                                        size="small"
                                        onChange={(e) =>
                                            this.setState({
                                                activeQuantity: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                            </Row>
                        </div>

                        <div className="mt-2 mr-1">
                            <Button
                                style={{ float: "right" }}
                                onClick={(e) => {
                                    this.setState({
                                        showProudctUpdateModal: false,
                                    });
                                    this.handleUpdateSubmit(e);
                                }}
                                variant="contained"
                                color="primary"
                            >
                                Update
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };

    renderProductData = () => {
        if (this.state.products == null) {
            return null;
        }

        const products = this.state.products;
        let last_modified = null;

        return products.map((record) => {
            // extract date only
            last_modified = moment(record["last_modified"]).format(
                "DD/MM/YYYY"
            );

            return (
                <tr>
                    <td align="center">
                        <Badge variant="primary">
                            {record["id"]}
                            <span hidden>$</span>
                        </Badge>{" "}
                    </td>
                    <td>{record["name"]}</td>
                    <td>{record["unitPrice"]}</td>
                    <td>{record["quantity"]}</td>

                    <td>{last_modified}</td>
                    <td align="center">
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={(e) => {
                                this.setState({
                                    activeProductId: record.id,
                                    activeName: record.name,
                                    activeUnitPrice: record.unitPrice,
                                    activeQuantity: record.quantity,
                                    showProudctUpdateModal: true,
                                });
                            }}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        {/* delete record */}
                        <Button
                            variant="contained"
                            onClick={(e) => {
                                if (window.confirm("Delete the item?")) {
                                    this.deleteProduct(record.id);
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </Button>
                    </td>
                </tr>
            );
        });
    };

    render() {
        return (
            <div className="container-fluid border m-0 p-1">
                {this.renderUpdateModal()}
                <br />
                <div
                    className="btn-group mb-3"
                    role="group"
                    aria-label="Basic example"
                >
                    <AddNewEntry refreshLedger={() => this.refreshLedger()} />
                </div>

                <Row className="ml-0 mr-0">
                    <Col md="12" className="p-0 m-0 measure1">
                        <TableContainer
                            component={Paper}
                            style={{ maxHeight: "79vh" }}
                        >
                            <table
                                id="product_table"
                                className="display"
                                style={{ width: "100%" }}
                            >
                                <thead>
                                    <tr>
                                        <th align="center">ID</th>
                                        <th align="center">Name</th>
                                        <th>Unit Price</th>
                                        <th>quantity</th>
                                        <th>last modified</th>
                                        <th align="center">Options</th>
                                    </tr>
                                </thead>
                                <TableBody>
                                    {this.renderProductData()}
                                </TableBody>
                            </table>
                        </TableContainer>
                    </Col>
                </Row>
            </div>
        );
    }
}
