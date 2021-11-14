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
            productId: 0,
            quntity: 0,
            amount: 0,
            paid: 0,
            pending: 0,

            products: null,
        };
    }

    fetchProducts = () => {
        const query = `SELECT name FROM products where status = 1`;
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
                console.log("product data fetch error: ", err);
            });
    };

    updateProductCount(
        productId = this.state.productId,
        quantity = this.state.quantity,
        add = true
    ) {
        let query = ``;
        if (add === true) {
            query = `UPDATE products SET quantity = quantity + ${quantity} WHERE id=${productId};`;
        } else {
            query = `UPDATE products SET quantity = quantity - ${quantity} WHERE id=${productId};`;
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

    handleAddSubmit(e) {
        e.preventDefault();

        // calculate pending amount
        let pending = this.state.amount - this.state.paid;

        const query = `INSERT INTO stockLedger(productId, quantity, amount, paid, pending) VALUES(${this.state.productId}, ${this.state.quantity}, ${this.state.amount}, ${this.state.paid}, ${pending});`;

        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(API_URL, data)
            .then((res) => {
                this.updateProductCount();
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
    }

    render() {
        return (
            <div className="row">
                <form autoComplete="off">
                    <div className="row ml-4 mt-4">
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
                            color="secondary"
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
