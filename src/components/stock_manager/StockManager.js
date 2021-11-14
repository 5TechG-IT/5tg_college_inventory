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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@material-ui/core";
import { Row, Col, Button as Btn1, Modal, Badge } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

// Toastify imports
import { toast } from "react-toastify";

// import child components
import { AddNewEntry } from "./AddNewEntry.js";

//API handling components
import { API_URL } from "./../../global";
const axios = require("axios");

export default class StockManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            partyId: 0,
            showAddModal: false,
            showUpdateModal: false,
            showProudctUpdateModal: false,
            activeSupplier: null,
            activeProduct: null,
            activeQuantity: null,
            activeAmount: null,
            activePaid: null,
            activePending: null,
            activeProdutUpdateCount: 0,
            totalBalance: 0,
            productCount: null,
            stockLedger: null,
            products: null,
        };
    }

    fetchProducts = () => {
        const query = `SELECT * FROM products where status = 1;`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                this.setState({ products: res.data });
            })
            .catch((err) => {
                console.log("product data fetch error: ", err);
            });
    };

    fetchstockLedger = () => {
        const query = `SELECT p.name, s.* FROM stockLedger s left join products p on p.id = s.productId WHERE s.status=1`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("ledger data: ", res.data);
                this.setState({ stockLedger: res.data });
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("ledger data fetch error: ", err);
            });
    };

    handleUpdateSubmit(e) {
        let url = API_URL;

        const query = `UPDATE stockLedger SET paid = paid + ${this.state.activePaid}, pending = pending - ${this.state.activePaid} WHERE id=${this.state.activeRecordId};`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                toast.success("Record details updated successfully");
                this.fetchstockLedger();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    reduceProductCount(productId, quantity) {
        const query = `UPDATE products SET quantity = quantity - ${quantity}  WHERE id = ${productId};`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("count update status data: ", res.data);
                console.log("count updated successfully");
                setTimeout(() => {
                    this.refreshLedger();
                }, 2000);
            })
            .catch((err) => {
                console.log("record delete error: ", err);
            });
    }

    deleteRecord(id, productId, quantity) {
        const query = `UPDATE stockLedger SET status = 0  WHERE id = ${id};`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("deleted status data: ", res.data);
                console.log("record deleted successfully");
                toast.error("Record deleted successfully");
                this.reduceProductCount(productId, quantity);
            })
            .catch((err) => {
                console.log("record delete error: ", err);
            });
    }

    refreshLedger() {
        window.location.reload(false);
    }

    componentDidMount() {
        this.fetchstockLedger();
        this.fetchProducts();
    }

    initializeDataTable() {
        $("#ledger_table").DataTable({
            destroy: true,
        });
    }

    renderProductCount = () => {
        if (!this.state.products || this.state.products.length < 1) return null;

        return this.state.products.map((product, index) => {
            return (
                <Button
                    color={product.quantity < 20 ? "secondary" : "primary"}
                    variant="outlined"
                    className="float-left mb-2 mr-1"
                    size="sm"
                >
                    <h6>
                        {product.name}:&nbsp; &nbsp;
                        <b>{product.quantity}</b>
                    </h6>
                </Button>
            );
        });
    };

    renderstockLedger = () => {
        if (this.state.stockLedger == null) {
            return null;
        }

        const ledger = this.state.stockLedger;
        let last_modified = null;

        return ledger.map((record) => {
            // extract date only
            last_modified = moment(record["last_modified"]).format(
                "DD / MM / YYYY HH:MM"
            );

            return (
                <tr>
                    <td align="center">
                        <Badge variant="primary">
                            {record["id"]}
                            <span hidden>$</span>
                        </Badge>{" "}
                    </td>
                    <td>{record.name}</td>
                    <td>{record["quantity"]}</td>
                    <td>{record["amount"]}</td>
                    <td>{record["paid"]}</td>
                    <td>{record["pending"]}</td>
                    <td>{last_modified}</td>
                    <td align="center">
                        <Button
                            color="secondary"
                            variant="contained"
                            className="mr-2"
                            onClick={(e) => {
                                this.setState({
                                    activeRecordId: record.id,
                                    activePaid: record.pending,
                                });
                                this.setState({ showUpdateModal: true });
                            }}
                        >
                            <FontAwesomeIcon icon={faPenAlt} />
                        </Button>
                        <Modal
                            show={this.state.showUpdateModal}
                            onHide={(e) =>
                                this.setState({ showUpdateModal: false })
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
                                            <Col>
                                                <TextField
                                                    id="paid"
                                                    label="Paid"
                                                    variant="outlined"
                                                    className="m-2"
                                                    defaultValue={
                                                        this.state.activePaid
                                                    }
                                                    onChange={(e) =>
                                                        this.setState({
                                                            activePaid:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                                <Btn1
                                                    className="mt-3"
                                                    onClick={(e) => {
                                                        this.setState({
                                                            showUpdateModal: false,
                                                        });
                                                        this.handleUpdateSubmit(
                                                            e
                                                        );
                                                    }}
                                                >
                                                    Update
                                                </Btn1>
                                            </Col>
                                        </Row>
                                    </div>
                                </form>
                            </Modal.Body>
                        </Modal>

                        {/* delete record */}
                        <Button
                            variant="contained"
                            onClick={(e) => {
                                if (window.confirm("Delete the item?")) {
                                    this.deleteRecord(
                                        record.id,
                                        record.productId,
                                        record.quantity
                                    );
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
                                id="ledger_table"
                                className="display"
                                style={{ width: "100%" }}
                            >
                                <thead>
                                    <tr>
                                        <th align="center">ID</th>
                                        <th>Product</th>
                                        <th>quantity</th>
                                        <th align="center">amount</th>
                                        <th>paid</th>
                                        <th>pending</th>
                                        <th>last modified</th>
                                        <th align="center">Options</th>
                                    </tr>
                                </thead>
                                <TableBody>
                                    {this.renderstockLedger()}
                                </TableBody>
                            </table>
                        </TableContainer>
                    </Col>
                </Row>
            </div>
        );
    }
}
