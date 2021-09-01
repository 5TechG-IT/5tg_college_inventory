import React, { Component } from "react";
import "./style.css";
import { Button, TextField, Paper } from "@material-ui/core";
import { Badge, Card, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

//Bootstrap and jQuery libraries
import "bootstrap/dist/css/bootstrap.min.css";
import "jquery/dist/jquery.min.js";
//Datatable Modules
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import $ from "jquery";

//API handling components
import { API_URL } from "./../../global";
const axios = require("axios");

export class expenses extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDeleteModal: false,
            description: "",
            amount: "",
            expenseData: {},
            activeExpenseId: null,
        };
    }
    getExpenseData() {
        const query = `SELECT *  from expenses order by id desc;`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(API_URL, data)
            .then((res) => {
                console.log(res.data);
                this.setState({ expenseData: res.data });
                this.initializeDataTable();
            })
            .catch((err) => {
                console.log(err);
                toast("failed to fetch");
            });
    }
    componentDidMount() {
        this.getExpenseData();
    }
    handleSubmit(e, state) {
        e.preventDefault();
        const { description, amount } = state;
        const date = new Date();
        const query = `INSERT INTO expenses (description,date,amount) VALUES('${description}','${moment(
            date
        ).format()}',${amount});`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(API_URL, data)
            .then((res) => {
                toast("expense saved successfully");
                this.getExpenseData();
            })
            .catch((err) => {
                console.log(err);
                toast("failed to save");
            });
    }

    deleteExpense(id) {
        const query = `DELETE from expenses WHERE id=${id};`;
        let data = {
            crossDomain: true,
            crossOrigin: true,
            query: query,
        };
        axios
            .post(API_URL, data)
            .then((res) => {
                toast.success("expense deleted successfully");
                this.getExpenseData();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    initializeDataTable() {
        $("#expenses_table").DataTable({
            destroy: true,
        });
    }

    render() {
        return (
            <div
                className="container-fluid border m-0 p-1 main"
                style={{ backgroundColor: "aliceblue" }}
            >
                <Card>
                    <Card.Body className="mt-0 pt-3">
                        <Card.Title>Manage Expenses</Card.Title>
                        <form
                            noValidate
                            autoComplete="off"
                            onSubmit={(e) => this.handleSubmit(e, this.state)}
                        >
                            <div className="mt-3">
                                <TextField
                                    id="amount"
                                    label="Amount"
                                    variant="outlined"
                                    type="number"
                                    size="small"
                                    value={this.state.amount}
                                    className="mr-3"
                                    onChange={(e) =>
                                        this.setState({
                                            amount: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    id="description"
                                    label="Description"
                                    variant="outlined"
                                    size="small"
                                    value={this.state.description}
                                    className="mr-3"
                                    style={{ minWidth: "30vw" }}
                                    onChange={(e) =>
                                        this.setState({
                                            description: e.target.value,
                                        })
                                    }
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Add expense
                                </Button>
                            </div>
                        </form>
                    </Card.Body>
                </Card>
                <div
                    component={Paper}
                    style={{ width: "100%" }}
                    className="mt-2"
                >
                    <table
                        id="expenses_table"
                        className="display"
                        style={{ width: "100%" }}
                    >
                        <thead>
                            <tr>
                                <th align="center">Expense Id</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th align="center">Option</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.expenseData.length > 0 ? (
                                this.state.expenseData.map((expense) => {
                                    return (
                                        <tr key={expense.id}>
                                            <td align="center">
                                                <Badge variant="primary">
                                                    {" "}
                                                    {expense.id}
                                                </Badge>
                                            </td>
                                            <td
                                                style={{
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {expense.description}
                                            </td>
                                            <td>₹ {expense.amount}</td>
                                            <td>
                                                {moment(expense.date).format(
                                                    "D/M/YYYY h:mm A"
                                                )}
                                            </td>
                                            <td align="center">
                                                <Button
                                                    color="secondary"
                                                    variant="contained"
                                                    className="mt-1 mb-1"
                                                    onClick={(e) => {
                                                        this.setState({
                                                            activeExpenseId:
                                                                expense.id,
                                                        });
                                                        this.setState({
                                                            showDeleteModal: true,
                                                        });
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTrash}
                                                    />
                                                </Button>
                                                <Modal
                                                    show={
                                                        this.state
                                                            .showDeleteModal
                                                    }
                                                    onHide={(e) =>
                                                        this.setState({
                                                            showDeleteModal: false,
                                                        })
                                                    }
                                                    size="md"
                                                    aria-labelledby="contained-modal-title-vcenter"
                                                    centered
                                                >
                                                    <Modal.Header closeButton>
                                                        <Modal.Title id="contained-modal-title-vcenter">
                                                            Delete expense
                                                            record
                                                        </Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <p>
                                                            Do you really want
                                                            to delete this
                                                            expense?
                                                        </p>
                                                        <Button
                                                            color="danger"
                                                            variant="contained"
                                                            className="mt-1 mb-1"
                                                            onClick={() => {
                                                                this.deleteExpense(
                                                                    this.state
                                                                        .activeExpenseId
                                                                );
                                                                this.setState({
                                                                    showDeleteModal: false,
                                                                });
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Modal.Body>
                                                </Modal>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td>No data found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <ToastContainer
                    position={toast.POSITION.TOP_RIGHT}
                    autoClose={3000}
                />
            </div>
        );
    }
}

export default expenses;
