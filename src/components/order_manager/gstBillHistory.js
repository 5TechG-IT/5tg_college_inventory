import React, { Component } from "react";
import { Row, Col, Modal, Card, Table as Tbl } from "react-bootstrap";

//Bootstrap and jQuery libraries
import "bootstrap/dist/css/bootstrap.min.css";
import "jquery/dist/jquery.min.js";
//Datatable Modules
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import $ from "jquery";
import { toast } from "react-toastify";

import moment from "moment";

import { Button, TextField } from "@material-ui/core";

// font awasome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPenAlt,
    faEye,
    faTrash,
    faEdit,
} from "@fortawesome/free-solid-svg-icons";

import qrCodeImg from "./assets/qrcode.jpeg";
//API handling components
import { API_URL } from "./../../global";
const axios = require("axios");

export default class GstBillHistory extends Component {
    constructor(props) {
        super();

        this.state = {
            billList: null,
            showUpdateModel: false,
            activeBillId: null,
            activePaid: 0,

            aadharCard: null,
            adjustment: 0,
            balance: 0,
            code: null,
            date: null,
            gst: null,
            paid: 0,
            partyId: null,
            pname: null,
            total: 0,
            vehicleNo: null,

            itemsList: [],
            isLoadingItems: false,
        };
    }

    fetchBillList = () => {
        let url = API_URL;
        const query = `SELECT gb.*, p.name as pname FROM gstBill as gb inner join party as p where gb.partyId = p.id AND gb.status=1 ORDER BY gb.id DESC;`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("bill: ", res.data);
                this.setState({ billList: res.data });

                // init data table
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("deliveryMemo list fetch error: ", err);
            });
    };

    fetchBillItemList = () => {
        let url = API_URL;
        const query = `SELECT bl.* FROM billList as bl inner join gstBill as gb on bl.billType=gb.id where bl.billId= ${this.state.activeBillId}`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("bill list data: ", res.data);
                this.setState({ itemsList: res.data });

                // init data table
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log("bill list fetch error: ", err);
            });
    };

    deleteRecord(id) {
        let url = API_URL;
        const query = `UPDATE gstBill SET status = 0  WHERE id=${id};`;
        let data = { crossDomain: true, crossOrigin: true, query: query };
        axios
            .post(url, data)
            .then((res) => {
                console.log("deleted status data: ", res.data);
                toast.success("item deleted successfully");
                toast.success("Record deleted successfully");
                this.fetchBillList();
            })
            .catch((err) => {
                console.log("record delete error: ", err);
                toast.error("Failed to delete record");
            });
    }

    initializeDataTable() {
        const title = "GST bill history-" + moment().format("DD/MM/YYYY");
        $(document).ready(function () {
            $("#billList").DataTable({
                destroy: true,
                dom:
                    "<'row mb-2'<'col-sm-9' B><'col-sm-3' >>" +
                    "<'row mb-2'<'col-sm-9' l><'col-sm-3' f>>" +
                    "<'row'<'col-sm-12' tr>>" +
                    "<'row'<'col-sm-7 mt-2 mr-5 pr-4'i><'ml-5' p>>",
                buttons: [
                    {
                        extend: "csv",
                        title,
                        download: "open",
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5, 6],
                        },
                    },
                    {
                        extend: "print",
                        title,
                        messageTop: `<h4 style='text-align:center'>${title}</h4>`,
                        download: "open",
                        exportOptions: {
                            columns: [0, 1, 2, 3, 4, 5, 6],
                        },
                    },
                ],
            });
        });
    }

    initializeData() {
        this.fetchBillList();
    }
    componentDidMount() {
        this.initializeData();
    }

    handleUpdateSubmit(e) {
        let url = API_URL;
        const query = `UPDATE gstBill SET balance = balance - ${this.state.activePaid}, paid = paid + ${this.state.activePaid} WHERE id=${this.state.activeBillId};`;

        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(url, data)
            .then((res) => {
                toast.success("Bill details updated successfully");
                this.fetchBillList();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    renderMemoList = () => {
        if (this.state.billList == null) return null;

        // else
        return this.state.billList.map((bill) => {
            return (
                <tr align="center">
                    <td>{bill.id}</td>
                    <td>{bill.pname}</td>
                    <td>{bill.gst}</td>
                    <td>{bill.adjustment}</td>
                    <td>{bill.total}</td>
                    <td>{bill.paid}</td>
                    <td>{bill.balance}</td>
                    <td>{moment(bill.date).format("DD/MM/YYYY")}</td>
                    <td className="d-flex justify-content-center">
                        &nbsp;
                        <Button
                            className="mt-2"
                            color="primary"
                            variant="contained"
                            onClick={() => {
                                this.setState(
                                    {
                                        activeBillId: bill.id,
                                        showDisplayBillModal: true,
                                        aadharCard: bill.aadharCard,
                                        code: bill.code,
                                        date: bill.date,
                                        pname: bill.pname,
                                        total: bill.total,
                                        gst: bill.gst,
                                        adjustment: bill.adjustment,
                                        vehicleNo: bill.vehicleNo,
                                    },
                                    this.fetchBillItemList
                                );
                            }}
                        >
                            <FontAwesomeIcon icon={faEye} />
                        </Button>
                        <Button
                            className="mt-2"
                            color="secondary"
                            variant="contained"
                            onClick={() => {
                                this.setState({
                                    activeBillId: bill.id,
                                    showUpdateModel: true,
                                });
                            }}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button
                            className="mt-2"
                            color="danger"
                            variant="contained"
                            onClick={(e) => {
                                if (window.confirm("Delete the item?")) {
                                    this.deleteRecord(bill.id);
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

    renderUpdateModal = () => {
        return (
            <Modal
                show={this.state.showUpdateModel}
                onHide={(e) => this.setState({ showUpdateModel: false })}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Update bill
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form noValidate autoComplete="off">
                        <div className="mt-3">
                            <Row>
                                <Col xs={12}>
                                    <TextField
                                        id="pending"
                                        label="Paid"
                                        variant="outlined"
                                        className="m-2"
                                        defaultValue=""
                                        value={this.state.activePaid}
                                        onChange={(e) =>
                                            this.setState({
                                                activePaid: e.target.value,
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
                                        showUpdateModel: false,
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

    renderDisplayBillModal = () => {
        return (
            <Modal
                show={this.state.showDisplayBillModal}
                onHide={(e) => this.setState({ showDisplayBillModal: false })}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Bill details
                    </Modal.Title>
                </Modal.Header>
                <div className="mt-1 measure">
                    <Row>
                        <Col className="mx-auto">
                            <Card className="p-0">
                                <Card.Header>
                                    <Card.Title className="text-center pb-0 mb-0">
                                        <b>MINISHO</b>
                                    </Card.Title>
                                    <hr />

                                    <p className="text-center">
                                        Customer Care No. 77720031305, 06, 07
                                        <hr />
                                        email ID: customer.care@minisho.com
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
                                            <b>{this.state.activeBillId}</b>
                                        </p>
                                        <p>
                                            Date{" "}
                                            <b>
                                                {moment(this.state.date).format(
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
                                                <b>{this.state.pname}</b>
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
                                                Address:{" "}
                                                <b>{this.state.address}</b>
                                            </h6>
                                        </Col>
                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Vehicle No.:{" "}
                                                <b>{this.state.vehicleNo}</b>
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
                                                <b>{this.state.aadharCard}</b>
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
                                                    {moment(
                                                        this.state.date
                                                    ).format("DD/MM/YYYY")}
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
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Code: <b>{this.state.code}</b>
                                            </h6>
                                        </Col>
                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Sign:
                                            </h6>
                                        </Col>
                                    </Row>
                                </Card.Body>
                                <Card.Body className="m-0 pt-0">
                                    {/* Order overview */}
                                    <Tbl striped bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>Particular</th>
                                                <th>HSN Code</th>
                                                <th>Box Qty.</th>
                                                <th>Rate</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        {this.state.itemsList.length > 0 ? (
                                            <tbody>
                                                {this.state.itemsList.map(
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
                                                                <td>2201</td>
                                                                <td>
                                                                    {
                                                                        item.boxQty
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
                                                            </tr>
                                                        );
                                                    }
                                                )}
                                                <br></br>
                                                <tr>
                                                    <td colSpan="4">
                                                        Total amount before tax
                                                    </td>
                                                    <td colSpan="2">
                                                        {this.state.total -
                                                            this.state.gst +
                                                            this.state
                                                                .adjustment}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="4">SGST 9%</td>
                                                    <td colSpan="2">
                                                        {this.state.gst / 2}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="4">CGST 9%</td>
                                                    <td colSpan="2">
                                                        {this.state.gst / 2}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="4">
                                                        IGST 18%
                                                    </td>
                                                    <td colSpan="2">
                                                        {this.state.gst}
                                                    </td>
                                                </tr>
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
                                                        {this.state.total}
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
                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                GSTIN No.:{" "}
                                                <b>27AOLPK5202K1ZU</b>
                                            </h6>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Date: 28/06/2017
                                            </h6>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                State : Maharashtra Code: 27
                                            </h6>
                                        </Col>

                                        <Col md={6}>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                Bank A/c: <b>16153011000070</b>
                                            </h6>
                                            <h6
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                IFSC Code : BKID0001615
                                            </h6>
                                            <h6>Branch: Sangli</h6>
                                        </Col>
                                    </Row>
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Modal>
        );
    };

    render() {
        return (
            <div>
                <Row>
                    <Col
                        md="12"
                        className="m-0 p-1 measure1"
                        style={{ minHeight: "85vh" }}
                    >
                        <div>
                            <table
                                id="billList"
                                class="display"
                                style={{ width: "100%" }}
                            >
                                <thead>
                                    <tr align="center">
                                        <th align="center">Bill Id</th>
                                        <th align="center">Party Name</th>
                                        <th align="center">GST</th>
                                        <th align="center">Adjustment</th>
                                        <th align="center">Total</th>
                                        <th align="center">Paid</th>
                                        <th align="center">Balance</th>
                                        <th align="center">Date</th>
                                        <th align="center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>{this.renderMemoList()}</tbody>
                            </table>
                            {this.renderUpdateModal()}
                            {this.renderDisplayBillModal()}
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}
