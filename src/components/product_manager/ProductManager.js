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

export default class ProductManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            partyId: 0,
            showAddModal: false,
            showProudctUpdateModal: false,
            activeProduct: null,
            activeQuantity: null,
            products: null,
        };
    }

    fetchProducts = () => {
        const query = `SELECT * FROM products`;
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

    deleteRecord(id) {
        let data = { crossDomain: true, crossOrigin: true, query: null };
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

    renderProductData = () => {
        if (this.state.products == null) {
            return null;
        }

        const products = this.state.products;
        let last_modified = null;

        return products.map((record) => {
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
                    <td>{record["name"]}</td>
                    <td>{record["quantity"]}</td>

                    <td>{last_modified}</td>
                    <td align="center">
                        {/* delete record */}
                        <Button
                            variant="contained"
                            onClick={(e) => {
                                if (window.confirm("Delete the item?")) {
                                    this.deleteRecord(record.id);
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
