import React, { useState } from "react";
import { Row, Col, Navbar } from "react-bootstrap";
import {
    Switch,
    HashRouter as Router,
    Route,
    Redirect,
} from "react-router-dom";
// import CSS styles
import "bootstrap/dist/css/bootstrap.css";

// import components
import NavbarPanel from "./NavbarPanel";
import PartyManager from "../party_manager/PartyManager";
import ExpenseManager from "../expense_manager/ExpenseManager";
import ProductManager from "../product_manager/ProductManager";
import OrderManager from "../order_manager/orderManager";
import LedgerManager from "../ledger_manager/LedgerManager";

function Main(props) {
    const [authenticated, setAuthenticated] = useState(props.location.state);

    function logout() {
        setAuthenticated(null);
    }
    if (authenticated || true) {
        //const { userName } = authenticated;
        const userName = "user1";
        return (
            <Router>
                <Navbar bg="dark" expand="lg">
                    <Navbar.Brand id="title" href="#home">
                        Inventory Management | Admin Panel
                    </Navbar.Brand>
                </Navbar>
                <div className="container-fluid m-0 p-0">
                    <Row className="m-0 p-0">
                        <Col className="col-sm-2 mt-1 pl-1 pr-1">
                            <NavbarPanel
                                user={userName}
                                logout={() => logout()}
                            />
                        </Col>
                        <Col className="col-sm-10 mt-1 p-0">
                            <Switch>
                                {/* Manager Routes */}
                                <Route
                                    exact
                                    path="/mainDashboard"
                                    component={OrderManager}
                                />
                                <Route
                                    path="/partyManager"
                                    exact
                                    component={PartyManager}
                                />

                                <Route
                                    path="/productManager"
                                    exact
                                    component={ProductManager}
                                />
                                <Route
                                    path="/expenseManager"
                                    exact
                                    component={ExpenseManager}
                                />
                                <Route
                                    path="/ledgerManager/:partyId"
                                    exact
                                    component={LedgerManager}
                                />
                            </Switch>
                        </Col>
                    </Row>
                </div>
            </Router>
        );
    } else {
        return <Redirect to="/" />;
    }
}

export default Main;
