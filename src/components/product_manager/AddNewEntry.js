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
            name: null,
            unitPrice: 0,
            quntity: 0,
            amount: 0,
        };
    }

    handleAddSubmit(e) {
        e.preventDefault();

        const query = `INSERT INTO products(name, unitPrice, quantity) VALUES('${this.state.name}', ${this.state.unitPrice}, ${this.state.quantity});`;

        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(API_URL, data)
            .then((res) => {
                toast.success("Product record added successfully");
            })
            .catch((err) => {
                console.log(err);
            });
    }

    render() {
        return (
            <div className="row">
                <form autoComplete="off">
                    <div className="row ml-4 mt-4">
                        <TextField
                            id="name"
                            label="name"
                            variant="outlined"
                            type="text"
                            className="mr-2"
                            required={true}
                            size="small"
                            onChange={(e) =>
                                this.setState({ name: e.target.value })
                            }
                        />

                        <TextField
                            id="unitPrice"
                            label="Unit Price"
                            variant="outlined"
                            type="number"
                            className="mr-2"
                            size="small"
                            onChange={(e) =>
                                this.setState({ unitPrice: e.target.value })
                            }
                        />

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
