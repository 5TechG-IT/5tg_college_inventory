import React from "react";
import { Link } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import "./style.css";

function NavbarPanel(props) {
    const handleLogout = () => {
        props.logout();
    };
    return (
        <div className="container-fluid  main-navbar">
            <div>
                <Card className="mb-2">
                    <Card.Body className="p-2 profile-body">
                        <Avatar className="profile">
                            {props.user.slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Badge
                            variant="warning"
                            className="mt-2"
                            style={{ textTransform: "capitalize" }}
                        >
                            {props.user}
                        </Badge>
                    </Card.Body>
                </Card>
                <Card border="primary" className="mb-2">
                    <Card.Body className="m-0 p-1">
                        <h6>Menu</h6>
                        <Link to="/mainDashboard">
                            <Button
                                variant="primary"
                                size="sm"
                                block
                                className="mb-2"
                            >
                                Order Manager
                            </Button>
                        </Link>

                        <Link to="/stockManager">
                            <Button
                                variant="primary"
                                size="sm"
                                block
                                className="mb-2"
                            >
                                Stock Manager
                            </Button>
                        </Link>

                        <Link to="/partyManager">
                            <Button
                                variant="primary"
                                size="sm"
                                block
                                className="mb-2"
                            >
                                Party Manager
                            </Button>
                        </Link>
                        <Link to="/expenseManager">
                            <Button
                                variant="primary"
                                size="sm"
                                block
                                className="mb-2"
                            >
                                Expense Manager
                            </Button>
                        </Link>
                        <Link to="/workerManager">
                            <Button
                                variant="primary"
                                size="sm"
                                block
                                className="mb-2"
                                hidden
                            >
                                Worker Manager
                            </Button>
                        </Link>
                    </Card.Body>
                </Card>
                <Card className="m-0 p-1">
                    <Card.Body className="m-0 p-1">
                        <Link to="/mainDashboard">
                            <Button
                                variant="primary"
                                size="sm"
                                block
                                className="mb-2"
                                hidden
                            >
                                settings
                            </Button>
                        </Link>
                    </Card.Body>
                </Card>
            </div>
            <Row>
                <Col xs={6} className="mx-auto">
                    <Button
                        variant="dark btn-block"
                        size="sm"
                        className="mb-2"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Col>
            </Row>
        </div>
    );
}

export default NavbarPanel;
