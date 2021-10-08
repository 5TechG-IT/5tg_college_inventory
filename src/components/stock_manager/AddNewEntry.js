import React, { Component } from "react";

import {
    TextField,
    Button,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
} from "@material-ui/core";
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
            supplier: null,
            productId: 0,
            quntity: 0,
            amount: 0,
            paid: 0,
            pending: 0,

            linkedProductList: [],
            products: null,
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

    fetchLInkedProduct = () => {
        const query = `SELECT * FROM linkedStock`;

        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("lp ", res.data);
                this.setState({ linkedProductList: res.data });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    updateProductCount(
        productId = this.state.productId,
        quantity = this.state.quantity,
        add = true
    ) {
        let query = ``;
        if (add === true) {
            query = `UPDATE stockCount SET quantity = quantity + ${quantity} WHERE productId=${productId};`;
        } else {
            query = `UPDATE stockCount SET quantity = quantity - ${quantity} WHERE productId=${productId};`;
        }

        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("Product count updated successfully");
                setTimeout(() => {
                    this.props.refreshLedger();
                }, 2000);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    updateLinkedProductCount = () => {
        let linkedProductList = this.state.linkedProductList;
        for (var i = 0; i < linkedProductList.length; i++) {
            if (linkedProductList[i].stockId === this.state.productId) {
                this.updateProductCount(
                    linkedProductList[i].linkedStockId,
                    linkedProductList[i].quantity * this.state.quantity,
                    false
                );
            }
        }
    };

    handleAddSubmit(e) {
        e.preventDefault();

        // calculate pending amount
        let pending = this.state.amount - this.state.paid;

        const query = `INSERT INTO stockLedger( supplier, productId, quantity, amount, paid, pending) VALUES('${this.state.supplier}', ${this.state.productId}, ${this.state.quantity}, ${this.state.amount}, ${this.state.paid}, ${pending});`;

        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(API_URL, data)
            .then((res) => {
                this.updateProductCount();
                this.updateLinkedProductCount();
                toast.success("Product Tracking record added successfully");
            })
            .catch((err) => {
                console.log(err);
            });
    }

    renderMenu() {
        if (this.state.products != null) {
            return this.state.products.map((product, index) => {
                return <MenuItem value={index + 1}>{product}</MenuItem>;
            });
        }
    }

    componentDidMount() {
        this.fetchProducts();
        this.fetchLInkedProduct();
    }

    render() {
        return (
            <div className="row">
                <form autoComplete="off">
                    <div className="row ml-4 mt-4">
                        <TextField
                            id="supplier"
                            label="Supplier"
                            variant="outlined"
                            type="text"
                            className="mr-2"
                            required={true}
                            size="small"
                            onChange={(e) =>
                                this.setState({ supplier: e.target.value })
                            }
                        />
                        <FormControl
                            variant="filled"
                            className="mr-2 mb-2"
                            style={{ minWidth: "150px" }}
                            size="small"
                        >
                            <InputLabel id="demo-simple-select-outlined-label">
                                Product
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                onChange={(e) => {
                                    this.setState({
                                        productId: e.target.value,
                                    });
                                }}
                                name="productId"
                                value={this.state.productId}
                            >
                                {this.renderMenu()}
                            </Select>
                        </FormControl>
                        <TextField
                            id="quantity"
                            label="Quantity"
                            variant="outlined"
                            type="number"
                            className="mr-2"
                            size="small"
                            onChange={(e) =>
                                this.setState({ quantity: e.target.value })
                            }
                        />

                        <TextField
                            id="amount"
                            label="amount"
                            variant="outlined"
                            type="number"
                            className="mr-2"
                            size="small"
                            onChange={(e) =>
                                this.setState({ amount: e.target.value })
                            }
                        />
                        <TextField
                            id="paid"
                            label="paid"
                            variant="outlined"
                            className="mr-2"
                            type="number"
                            size="small"
                            onChange={(e) =>
                                this.setState({ paid: e.target.value })
                            }
                        />

                        <Button
                            color="primary"
                            variant="contained"
                            className="mb-3"
                            onClick={(e) => this.handleAddSubmit(e)}
                        >
                            <FontAwesomeIcon icon={faPlusCircle} size="2x" />
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            className="mb-3 ml-2"
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
