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

export default class MonthlySales extends Component {
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
        var begin = moment().format("YYYY-MM-01");
        var end = moment().format("YYYY-MM-") + moment().daysInMonth();
        const query = `SELECT particular as name, count(particular) as count FROM billList where lastModified BETWEEN '${begin} 00:00:00' AND '${end} 23:59:59' group by particular`;
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
                console.log("bill list fetch error: ", err);
            });
    };

    initializeDataTable() {
        const title = "Non-GST bill history-" + moment().format("DD/MM/YYYY");
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

    renderMemoList = () => {
        if (this.state.billList == null) return null;

        // else
        return this.state.billList.map((bill, index) => {
            return (
                <tr align="center">
                    <td>{index + 1}</td>
                    <td>{bill.name}</td>
                    <td>{bill.count}</td>
                </tr>
            );
        });
    };

    render() {
        return (
            <div>
                <h5>current month: {moment().format("MMM - YYYY")}</h5>
                <hr />
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
                                        <th align="center">Id</th>
                                        <th align="center">Product Name</th>
                                        <th align="center">Sale count</th>
                                    </tr>
                                </thead>
                                <tbody>{this.renderMemoList()}</tbody>
                            </table>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}
