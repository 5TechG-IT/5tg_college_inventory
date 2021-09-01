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
            LedgerData: null,
            currentLinkedProductList: [],
            linkedProductList: null,
            products: [
                "preform_500_ml",
                "perform_1_lit",
                "preform_2_lit",
                "l_dawar_500_ml",
                "l_dawar_1_lit",
                "l_dawar_2_lit",
                "l_dawar_5_lit",
                "l_dawar_20_lit",
                "l_warana_1_lit",
            ],
        };
    }

    fetchProducts = () => {
        const query = `SELECT name FROM products`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                let _res = res.data.map((item) => {
                    return item.name;
                });
                this.setState({ products: _res });
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("linkedStock data fetch error: ", err);
            });
    };

    fetchProductCount() {
        const query = `SELECT * FROM stockCount;`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("stockCount data: ", res.data);
                this.setState({ productCount: res.data });
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("stockCount data fetch error: ", err);
            });
    }

    fetchLedgerData = () => {
        const query = `SELECT * FROM stockLedger WHERE status=1;`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("BTledger data: ", res.data);
                this.setState({ LedgerData: res.data });
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("BTledger data fetch error: ", err);
            });
    };

    fetchLinkedProducts = () => {
        const query = `SELECT * FROM linkedStock`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                this.setState({ linkedProductList: res.data });
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("linkedStock data fetch error: ", err);
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
                this.fetchLedgerData();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    updateProductCount(productId, quantity) {
        const query = `UPDATE stockCount SET quantity = quantity - ${quantity}  WHERE productId = ${productId};`;
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
                this.updateProductCount(productId, quantity);
            })
            .catch((err) => {
                console.log("record delete error: ", err);
            });
    }

    addLinkedProduct = () => {
        let linkedProduct = {
            productName: this.state.activeProduct,
            activeProductUpdateCount: this.state.activeProdutUpdateCount,
        };
        let currentLinkedProductList = this.state.currentLinkedProductList;
        currentLinkedProductList.push(linkedProduct);
        this.setState({ currentLinkedProductList: currentLinkedProductList });
    };

    delLinkedProduct = (index) => {
        let currentLinkedProductList = this.state.currentLinkedProductList;
        delete currentLinkedProductList[index];

        this.setState({ currentLinkedProductList: currentLinkedProductList });
    };

    refreshLedger() {
        window.location.reload(false);
    }

    componentDidMount() {
        this.fetchLedgerData();
        this.fetchProducts();
        this.fetchProductCount();
        this.fetchLinkedProducts();
    }

    initializeDataTable() {
        $("#ledger_table").DataTable({
            destroy: true,
        });
    }

    renderProductCount = () => {
        if (!this.state.productCount || this.state.productCount.length < 1)
            return null;

        return this.state.products.map((product, index) => {
            console.log(this.state.productCount[0]);
            console.log(this.state.productCount[0]["quantity"]);
            return (
                <Button
                    color={
                        this.state.productCount[index]["quantity"] < 20
                            ? "secondary"
                            : "primary"
                    }
                    variant="outlined"
                    className="float-left mb-2 mr-1"
                    size="sm"
                >
                    <h6>
                        {product}:&nbsp; &nbsp;
                        <b>{this.state.productCount[index]["quantity"]}</b>
                    </h6>
                </Button>
            );
        });
    };

    renderLedgerData = () => {
        if (this.state.LedgerData == null) {
            return null;
        }

        const ledger = this.state.LedgerData;
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
                    <td align="center">{record["supplier"]}</td>
                    <td>{this.state.products[record["productId"] - 1]}</td>
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

    renderUpdateProductModal = () => {
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
                        Update product
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
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <MenuItem value={1}>
                                                Retialer
                                            </MenuItem>
                                            <MenuItem value={2}>
                                                Distributor
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Col>
                            </Row>
                            <hr />

                            <section>
                                <FormControl
                                    variant="filled"
                                    style={{
                                        minWidth: "120px",
                                    }}
                                    className="mt-2 ml-2"
                                >
                                    <label className="">Link product</label>

                                    <Row>
                                        <Col>
                                            <FormControl
                                                variant="filled"
                                                style={{
                                                    minWidth: "120px",
                                                }}
                                                className="mt-2 ml-2"
                                            >
                                                <InputLabel id="demo-simple-select-outlined-label">
                                                    Product
                                                </InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-outlined-label"
                                                    id="demo-simple-select-outlined"
                                                    label="type"
                                                    onChange={(e) =>
                                                        this.setState({
                                                            activeProduct:
                                                                e.target.value,
                                                        })
                                                    }
                                                >
                                                    {this.state.products.map(
                                                        (item) => {
                                                            return (
                                                                <MenuItem
                                                                    value={item}
                                                                >
                                                                    {item}
                                                                </MenuItem>
                                                            );
                                                        }
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Col>
                                        <Col>
                                            <TextField
                                                id="quantity"
                                                s
                                                label="Quantity"
                                                variant="outlined"
                                                className="m-2"
                                                defaultValue=""
                                                onChange={(e) =>
                                                    this.setState({
                                                        activeProdutUpdateCount:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </Col>

                                        <Col>
                                            <Button
                                                color="primary"
                                                variant="contained"
                                                className="mt-2"
                                                onClick={this.addLinkedProduct}
                                            >
                                                Add
                                            </Button>
                                        </Col>
                                    </Row>
                                </FormControl>
                            </section>
                        </div>
                        <hr />
                        <section>
                            <table
                                id="ledger_table"
                                className="display"
                                style={{ width: "100%" }}
                            >
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.currentLinkedProductList.map(
                                        (item, index) => {
                                            return (
                                                <tr>
                                                    <td>{item.productName}</td>
                                                    <td>
                                                        {
                                                            item.activeProductUpdateCount
                                                        }
                                                    </td>
                                                    <td>
                                                        <Button
                                                            onClick={(e) =>
                                                                this.delLinkedProduct(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faTrashAlt
                                                                }
                                                                style={{
                                                                    color: "red",
                                                                }}
                                                            />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </section>
                        <hr />
                        <div className="mt-2 mr-1">
                            <Btn1
                                style={{ float: "right" }}
                                onClick={(e) => {
                                    this.setState({
                                        showProudctUpdateModal: false,
                                    });
                                    this.handleAddSubmit(e);
                                }}
                            >
                                Update
                            </Btn1>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };

    render() {
        return (
            <div className="container-fluid border m-0 p-1">
                {this.renderUpdateProductModal()}
                <div
                    style={{
                        height: "190px",
                        overflow: "scroll",
                    }}
                >
                    <Row>{this.renderProductCount()}</Row>
                </div>

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
                                id="ledger_table"
                                className="display"
                                style={{ width: "100%" }}
                            >
                                <thead>
                                    <tr>
                                        <th align="center">ID</th>
                                        <th align="center">Supplier</th>
                                        <th>Product</th>
                                        <th>quantity</th>
                                        <th align="center">amount</th>
                                        <th>paid</th>
                                        <th>pending</th>
                                        <th>last modified</th>
                                        <th align="center">Options</th>
                                    </tr>
                                </thead>
                                <TableBody>{this.renderLedgerData()}</TableBody>
                            </table>
                        </TableContainer>
                    </Col>
                </Row>
            </div>
        );
    }
}
