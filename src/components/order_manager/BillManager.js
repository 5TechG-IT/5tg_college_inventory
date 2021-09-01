import React, { Component, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactToPrint from "react-to-print";
import moment from "moment";
import { Row, Col, Card, Badge, Table as Tbl } from "react-bootstrap";
import {
    TextField,
    Button,
    FormControl,
    MenuItem,
    Select,
    InputLabel,
} from "@material-ui/core";

import Autocomplete, {
    createFilterOptions,
} from "@material-ui/lab/Autocomplete";

import "./style.css";

import qrCodeImg from "./assets/qrcode.jpeg";

import { API_URL } from "./../../global";

const axios = require("axios");

export default class BillManager extends Component {
    constructor(props) {
        super();

        this.state = {
            billId: null,
            partyId: 0,
            partyName: null,
            newPartyName: null,
            address: null,
            aadharCardNo: null,
            gstin: null,
            billType: 1,

            routeName: "",

            date: moment(new Date()).format("YYYY-MM-DD"),

            particularValue: null,
            particular: null,
            quantity: 0,
            rate: 0,
            amount: 0,

            itemList: [],
            addedItems: [],

            advance: 0,
            total: 0,
            balance: 0,
            sgst: 0,
            cgst: 0,
            igst: 0,
            adjustment: 0,
            advance: 0,
            grandTotal: 0,

            printComponentRef: null,

            partyList: null,

            latestInsertId: 0,

            productList: [],

            routeOptions: [],
        };
    }

    fetchRouteOptions() {
        let url = API_URL;

        let query = "SELECT name from routes;";
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                console.log("route options data : ", res.data);
                const opts = res.data.map((record) => record.name);
                this.setState({ routeOptions: opts });
            })
            .catch((err) => {
                console.log("route options error : ", err);
            });
    }

    getIdPartyList() {
        let url = API_URL;
        // const query = `SELECT CONCAT(id, ', ', name) AS name, address FROM party;`;
        const query = `SELECT id, name, address FROM party;`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("id+name data: ", res.data);
                this.setState({ partyList: res.data });
            })
            .catch((err) => {
                console.log("id + name fetch error: ", err);
            });
    }

    getLatestId = () => {
        let url = API_URL;
        const query = `SELECT id FROM gstBill ORDER BY id DESC LIMIT 1;`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("latest id data: ", res.data);
                this.setState({
                    billId: (res.data[0] != null ? res.data[0]["id"] : 0) + 1,
                });
            })
            .catch((err) => {
                console.log("latest id data fetch error: ", err);
            });
    };

    fetchProducts = () => {
        const query = `SELECT name FROM products`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                let _res = res.data.map((item) => {
                    return item.name;
                });
                this.setState({ productList: _res });
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("productlist data fetch error: ", err);
            });
    };

    caluclateWeight = (field, value) => {
        if (field === "totalBoxes") {
            let weight = value * this.state.weightPerBox;
            this.setState({ totalBoxes: value });
            this.setState({ weight: weight });
        } else if (field === "weightPerBox") {
            let weight = this.state.totalBoxes * value;
            this.setState({ weightPerBox: value });
            this.setState({ weight: weight });
        }
    };

    calculateAmount = (field, value) => {
        if (field === "weight") {
            let amount = value * this.state.rate;
            this.setState({ weight: value });
            this.setState({ amount: amount });
        } else if (field === "rate") {
            let amount = this.state.weight * value;
            this.setState({ rate: value });
            this.setState({ amount: amount });
        }
    };

    calculateTaxes = () => {
        const total = this.state.total;
        this.setState(
            {
                sgst: Number((total / 100) * 9).toFixed(2),
                cgst: Number((total / 100) * 9).toFixed(2),
                igst: Number((total / 100) * 18).toFixed(2),
            },
            this.calculateGrandTotal
        );
    };

    calculateGrandTotal = () => {
        let grandTotal;
        if (this.state.billType === 1) {
            grandTotal =
                Number(this.state.total) +
                Number(this.state.igst) +
                Number(this.state.adjustment);
        } else {
            grandTotal =
                Number(this.state.total) + Number(this.state.adjustment);
        }
        this.setState({ grandTotal: grandTotal.toFixed(2) });
    };

    addItems = () => {
        if (!this.state.particular || !this.state.rate) return;
        // let items = this.state.itemList;
        let items = this.state.addedItems;
        const ifExists = items.find(
            (item) => item.particular === this.state.particular
        );
        if (ifExists) {
            items = items.map((item) => {
                if (item.particular === this.state.particular) {
                    return {
                        particular: this.state.particular,
                        quantity: +item.quantity + +this.state.quantity,
                        rate: +item.rate + +this.state.rate,
                        amount:
                            +item.amount +
                            +this.state.rate * +this.state.quantity,
                    };
                } else {
                    return item;
                }
            });
        } else {
            items.push({
                particular: this.state.particular,
                quantity: this.state.quantity,
                rate: this.state.rate,
                amount: this.state.rate * this.state.quantity,
            });
        }
        // items.push({
        //     particular: this.state.particular,
        //     mark: this.state.mark,
        //     totalBoxes: this.state.totalBoxes,
        //     weightPerBox: this.state.weightPerBox,
        //     weight: this.state.weight,
        //     rate: this.state.rate,
        //     amount: this.state.amount,
        // });

        this.setState({ addedItems: items });

        // update total & balance
        // let total = Number(this.state.total) + Number(this.state.amount);
        let total =
            Number(this.state.total) +
            Number(this.state.rate * this.state.quantity);
        this.setState({ total: total }, this.calculateTaxes);
        let balance = total + Number(this.state.advance);
        this.setState({ balance: balance });
        // this.calculateTaxes();
    };

    deleteItem = (index) => {
        // let itemList = this.state.itemList;
        let itemList = this.state.addedItems;

        // update total & balance
        let total = this.state.total - itemList[index]["amount"];
        let balance = total + Number(this.state.advance);
        this.setState({ total: total }, this.calculateTaxes);
        this.setState({ balance: balance });

        // remove element
        // let updatedList = itemList.filter((item, _index) => {
        //     if (index !== _index) return item;
        // });
        // this.setState({ itemList: updatedList });
        let updatedList = itemList.filter((item, _index) => {
            if (index !== _index) return item;
        });
        this.setState({ addedItems: updatedList });
    };

    handleClear = () => {
        return null;
    };

    insertBillList = () => {
        let url = API_URL;

        // 1.  insert into deliveryMemoList
        this.state.addedItems.map((item, index) => {
            const query = `INSERT INTO billList(billType, billId, partyId, particular,quantity, rate, amount, status) VALUES(
          ${this.state.billType},
          ${this.state.billId},
          ${this.state.partyId},
          '${item.particular}', 
          ${item.quantity}, 
          ${item.rate}, 
          ${item.amount},
          1
        )`;
            let data = { crossDomain: true, crossOrigin: true, query: query };
            axios
                .post(url, data)
                .then((res) => {
                    console.log("insert billList successfull, index: ", index);
                })
                .catch((err) => {
                    console.log("failed to insert billList, error: ", err);
                });
        });
    };

    insertLedgerRecord = () => {
        // 1.  insert into ledger
        const query = `INSERT INTO ledger(party_id, particular, total, memo_id) VALUES(${this.state.partyId}, 'reference bill id: ${this.state.latestInsertId}', ${this.state.total}, ${this.state.latestInsertId})`;

        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("insert ledger successful");
                console.log("insert response: ", res.data.insertId);
            })
            .catch((err) => {
                console.log("failed to insert ledger, error: ", err);
            });
    };

    insertNewPartyAndSave = () => {
        const query = `INSERT INTO party (name, address) values("${this.state.newPartyName}", "${this.state.address}")`;
        const data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log("insert party successful");
                console.log("insert response: ", res.data.insertId);
                this.setState({ partyId: res.data.insertId }, this.saveBill);
            })
            .catch((err) => {
                console.log("failed to insert party, error: ", err);
            });
    };

    saveBill = () => {
        const newDate = moment(new Date()).format("YYYY-MM-DD");
        let query;
        if (this.state.billType === 1) {
            query = `INSERT INTO gstBill (partyId, aadharCard, total, gst, adjustment, paid, balance, date, status) values(
        "${this.state.partyId}", 
        "${this.state.aadharCardNo}",     
        ${this.state.grandTotal},
        ${this.state.igst}, 
        ${this.state.adjustment}, 
        ${this.state.advance},
        ${this.state.grandTotal - this.state.advance}, 
        "${newDate}", 
        1)`;
        } else {
            query = `INSERT INTO nonGstBill (partyId, aadharCard, total, adjustment, paid, balance, routeName, date, status) values("
        ${this.state.partyId}", 
        "${this.state.aadharCardNo}", 
        ${this.state.grandTotal}, 
        ${this.state.adjustment}, 
        ${this.state.advance}, 
        ${this.state.grandTotal - this.state.advance},
        '${this.state.routeName}',
        "${newDate}", 
        1)`;
        }

        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(API_URL, data)
            .then((res) => {
                toast.success("Generated Bill successfully");
                this.setState(
                    { billId: res.data.insertId },
                    this.insertBillList
                );
            })
            .catch((err) => {
                toast.error("Failed to Generate Bill ");
            });
    };

    handleSave = async (e) => {
        e.preventDefault();

        // check party already exists
        let partyId = this.state.partyId;
        if (partyId === null) {
            this.insertNewPartyAndSave();
        } else {
            this.saveBill();
        }
    };

    handleSavePrint = (e) => {
        console.log("in handle save print");
        // 1. handle save
        this.handleSave();
    };

    componentDidMount() {
        this.getLatestId();
        this.getIdPartyList();
        this.fetchRouteOptions();
        this.fetchProducts();
    }

    render() {
        return (
            <form className="mb-5" onSubmit={(e) => e.preventDefault()}>
                {/* Input Party Details */}

                <FormControl
                    style={{ minWidth: "250px" }}
                    className="mr-2 mb-2 smt-0"
                >
                    <Autocomplete
                        id="free-solo-demo"
                        freeSolo
                        options={
                            this.state.partyList != null
                                ? this.state.partyList.map(
                                      (item) => item.id + ", " + item.name
                                  )
                                : []
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                // label="party name"
                                label="Party name"
                                variant="outlined"
                                size="small"
                                value={this.state.newPartyName}
                                onChange={(event) =>
                                    this.setState({
                                        newPartyName: event.target.value,
                                    })
                                }
                            />
                        )}
                        onChange={(event, value) => {
                            console.log(value);
                            if (value != null && value.length > 2) {
                                this.setState({
                                    partyId: value.split(", ")[0],
                                    partyName: value.split(", ")[1],
                                    address: this.state.partyList.find(
                                        (party) =>
                                            party.id == value.split(", ")[0]
                                    )?.address,
                                });
                            } else {
                                this.setState({
                                    partyId: null,
                                    partyName: "",
                                });
                            }
                        }}
                    />
                </FormControl>

                <TextField
                    id="custAddress"
                    label="Address"
                    variant="outlined"
                    className="mr-2"
                    value={this.state.address || ""}
                    onChange={(e) => this.setState({ address: e.target.value })}
                    // required="true"
                    disabled={!!this.state.partyId}
                    size="small"
                />
                <TextField
                    id="aadharCardNo"
                    label="Aadhar Card No"
                    variant="outlined"
                    className="mr-2"
                    value={this.state.aadharCardNo}
                    onChange={(e) =>
                        this.setState({ aadharCardNo: e.target.value })
                    }
                    // required="true"
                    size="small"
                />
                <TextField
                    id="gstin"
                    label="GSTIN"
                    variant="outlined"
                    className="mr-2 mt-1"
                    value={this.state.gstin}
                    onChange={(e) => this.setState({ gstin: e.target.value })}
                    // required="true"
                    size="small"
                />
                <FormControl
                    // variant="filled"
                    variant="outlined"
                    className="mr-2 mb-2 mt-2"
                    style={{ minWidth: "180px" }}
                    size="small"
                >
                    <InputLabel id="demo-simple-select-outlined-label">
                        Bill Type
                    </InputLabel>
                    <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        onChange={(e) =>
                            this.setState({ billType: e.target.value })
                        }
                        name="billType"
                        value={this.state.billType}
                        size="small"
                        label="Bill Type"
                    >
                        <MenuItem value={1}>GST</MenuItem>
                        <MenuItem value={2}>Non GST</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    id="adjustment"
                    label="Adjustment"
                    variant="outlined"
                    className="mr-2 mt-2"
                    value={this.state.adjustment}
                    onChange={(e) =>
                        this.setState({ adjustment: e.target.value })
                    }
                    // required="true"
                    size="small"
                    type="number"
                />
                <TextField
                    id="advance"
                    label="Advance"
                    variant="outlined"
                    className="mr-2 mt-2"
                    value={this.state.advance}
                    onChange={(e) => this.setState({ advance: e.target.value })}
                    // required="true"
                    size="small"
                    type="number"
                />

                {/* End of Input Party Details */}

                <hr />

                <Row>
                    <Col>
                        <FormControl
                            style={{ minWidth: "250px" }}
                            className="mr-2 mb-2 smt-0"
                        >
                            <Autocomplete
                                id="free-solo-demo"
                                freeSolo
                                options={
                                    this.state.productList != null
                                        ? this.state.productList.map(
                                              (item) => item
                                          )
                                        : []
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        // label="party name"
                                        label="product"
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                onChange={(event, value) => {
                                    // if (value != null && value.length > 2)
                                    //     this.setState({
                                    //         partyId: value.split(",")[0],
                                    //     });
                                    // this.setState({
                                    //     partyName: value.split(",")[1],
                                    // });
                                    this.setState({ particular: value });
                                }}
                            />
                        </FormControl>
                    </Col>
                    <Col>
                        <TextField
                            id="quantity"
                            label="Quantity"
                            variant="outlined"
                            className="mr-2 mt-1"
                            value={this.state.quantity}
                            onChange={(e) =>
                                this.setState({ quantity: e.target.value })
                            }
                            required="true"
                            size="small"
                            type="number"
                        />
                    </Col>
                    <Col>
                        <TextField
                            id="rate"
                            label="Rate"
                            variant="outlined"
                            className="mr-2 mt-1"
                            value={this.state.rate}
                            onChange={(e) =>
                                this.setState({ rate: e.target.value })
                            }
                            required="true"
                            size="small"
                            type="number"
                        />
                    </Col>
                    <Col>
                        <Button
                            color="primary"
                            variant="contained"
                            className="mt-2"
                            onClick={this.addItems}
                            disabled={
                                !this.state.particular ||
                                !this.state.rate ||
                                !this.state.quantity
                            }
                        >
                            Add
                        </Button>
                    </Col>
                </Row>

                <div className="mt-1 p-2 measure">
                    <Row>
                        <Col md={8} className="mx-auto">
                            <Card className="mt-2 p-0">
                                <Card.Header>
                                    <Card.Title className="text-center pb-0 mb-0">
                                        <b>
                                            Akshay Cement Vit & Cement Articles
                                        </b>
                                    </Card.Title>
                                    <hr />
                                    <p className="text-center pb-0 mb-0">
                                        Opp. of Sugar factory, Gate no. 2<br />
                                        Kavathe Mahankal, Dist: Sangli, PIN:
                                        416405
                                    </p>
                                    <p className="text-center">
                                        Customer Care No. 7028828831, 06, 07
                                        <hr />
                                        email ID: ashitoshpatil0777@gmail.com
                                    </p>
                                    <hr />

                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <p>
                                            Invoice No.{" "}
                                            <b>{this.state.billId}</b>
                                        </p>
                                        <p>
                                            Date{" "}
                                            <b>
                                                {moment(new Date()).format(
                                                    "D/M/YYYY"
                                                )}
                                            </b>
                                        </p>
                                    </span>
                                    <Card.Title className="text-center pb-0 mb-0">
                                        <h5>
                                            <b>TAX INVOICE</b>
                                        </h5>
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body className="pb-3 mb-0">
                                    <Row>
                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Party name:{" "}
                                                <b>
                                                    {this.state.partyName ||
                                                        this.state.newPartyName}
                                                </b>
                                            </h6>
                                        </Col>
                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Address:{" "}
                                                <b>{this.state.address}</b>
                                            </h6>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Aadhar Card No.:{" "}
                                                <b>{this.state.aadharCardNo}</b>
                                            </h6>
                                        </Col>
                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Date:{" "}
                                                <b>
                                                    {moment(new Date()).format(
                                                        "DD/MM/YYYY"
                                                    )}
                                                </b>
                                            </h6>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                GSTIN: <b>{this.state.gstin}</b>
                                            </h6>
                                        </Col>
                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            ></h6>
                                        </Col>
                                    </Row>
                                </Card.Body>
                                <Card.Body className="m-0 pt-0">
                                    {/* Order overview */}
                                    <Tbl striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>Particular</th>
                                                <th>quantity</th>
                                                <th>Rate</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        {this.state.addedItems.length > 0 ? (
                                            <tbody>
                                                {this.state.addedItems.map(
                                                    (item, index) => {
                                                        return (
                                                            // <tr key={"" + item.particularValue.title}>
                                                            //   <td>{item.particularValue.title} </td>
                                                            <tr
                                                                key={
                                                                    "" +
                                                                    item.particular
                                                                }
                                                            >
                                                                <td>
                                                                    {
                                                                        item.particular
                                                                    }{" "}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {item.rate}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        item.amount
                                                                    }
                                                                </td>
                                                                <td
                                                                    className="d-print-none"
                                                                    align="center"
                                                                >
                                                                    <Button
                                                                        variant="contained"
                                                                        color="secondary"
                                                                        onClick={() =>
                                                                            this.deleteItem(
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={
                                                                                faTrash
                                                                            }
                                                                        />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                                <br></br>
                                                {this.state.billType === 1 ? (
                                                    <>
                                                        <tr>
                                                            <td colSpan="4">
                                                                Total amount
                                                                before tax
                                                            </td>
                                                            <td colSpan="2">
                                                                {
                                                                    this.state
                                                                        .total
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="4">
                                                                SGST 9%
                                                            </td>
                                                            <td colSpan="2">
                                                                {
                                                                    this.state
                                                                        .sgst
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="4">
                                                                CGST 9%
                                                            </td>
                                                            <td colSpan="2">
                                                                {
                                                                    this.state
                                                                        .cgst
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="4">
                                                                IGST 18%
                                                            </td>
                                                            <td colSpan="2">
                                                                {
                                                                    this.state
                                                                        .igst
                                                                }
                                                            </td>
                                                        </tr>
                                                    </>
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4">
                                                            Total amount
                                                        </td>
                                                        <td colSpan="2">
                                                            {this.state.total}
                                                        </td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td colSpan="4">
                                                        Adjustment
                                                    </td>
                                                    <td colSpan="2">
                                                        {this.state.adjustment}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="4">
                                                        Grand Total
                                                    </td>
                                                    <td colSpan="2">
                                                        {this.state.grandTotal}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        ) : (
                                            <tbody>
                                                <tr>
                                                    <td colSpan="6">
                                                        No items added
                                                    </td>
                                                </tr>
                                            </tbody>
                                        )}
                                    </Tbl>
                                </Card.Body>
                                <Card.Footer className="pb-3 mb-0">
                                    <Row>
                                        <Col md={7}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Company Name :{" "}
                                                <b>
                                                    Akshay Cement Vit and cement
                                                    articles
                                                </b>
                                            </h6>

                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                GSTIN No.:{" "}
                                                <b>27BYLPP3515R1ZM</b>
                                            </h6>

                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                State : <b>Maharashtra</b>
                                            </h6>
                                        </Col>

                                        <Col md={5}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Bank : <b>ICICI</b>
                                            </h6>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Bank A/c: <b>365605006422</b>
                                            </h6>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                IFSC Code : <b>ICIC0006356</b>
                                            </h6>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Branch Name :{" "}
                                                <b>Kavathe Mahankal</b>
                                            </h6>
                                        </Col>
                                    </Row>
                                    <hr />
                                    <Row className="mt-5">
                                        <Col md={12}>
                                            <h6 className="float-right">
                                                Authorised Sign.
                                            </h6>
                                        </Col>
                                    </Row>
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <ReactToPrint
                    trigger={() => (
                        <Button
                            className="mt-2 mr-1"
                            color="primary"
                            variant="contained"
                            style={{ float: "right" }}
                            disabled={
                                (this.state.partyName ||
                                    this.state.newPartyName) &&
                                this.state.address
                                    ? false
                                    : true
                            }
                        >
                            Save & Print
                        </Button>
                    )}
                />
                <Button
                    className="mt-2 mr-1"
                    color="secondary"
                    variant="contained"
                    style={{ float: "right" }}
                    // type="submit"
                    onClick={this.handleSave}
                    disabled={
                        (this.state.partyName || this.state.newPartyName) &&
                        this.state.address
                            ? false
                            : true
                    }
                >
                    Save bill
                </Button>
                <Button
                    className="mt-2 mr-1"
                    color="secondary"
                    variant="contained"
                    style={{ float: "right" }}
                    onClick={this.handleClear}
                >
                    clear
                </Button>
            </form>
        );
    }
}
