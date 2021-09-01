import React, { useState } from "react";
import { Button } from "@material-ui/core";
import { Card, Table, Modal, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

//API handling components
import { API_URL } from "./../../global";
const axios = require("axios");

function OrderDetails(props) {
  const [modal, setModal] = useState(false);
  const [itemsData, setItemData] = useState([]);
  const getDetails = () => {
    setModal(true);
    let url = API_URL + "/executeQuery";
    const query = `SELECT *  from readymadeItem where orderId='${props.orderId}';`;
    let data = {
      crossDomain: true,
      crossOrigin: true,
      query: query,
    };
    axios
      .post(url, data)
      .then((res) => {
        console.log(res.data);
        setItemData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div>
      <Button color="primary" variant="contained" onClick={getDetails}>
        <FontAwesomeIcon icon={faEye} />
      </Button>
      <Modal
        show={modal}
        onHide={() => setModal(false)}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Order item details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card border="primary">
            <Card.Body className="pb-3">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h6 style={{ textTransform: "capitalize" }}>
                  <Badge variant="primary"> {props.name}</Badge>
                </h6>

                <h6 style={{ textTransform: "capitalize" }}>
                  {moment(props.date).format("D/M/YYYY h:m A")}
                </h6>
              </div>
            </Card.Body>
          </Card>

          <Table striped bordered hover className="mt-2">
            <thead>
              <tr>
                <th>Sr.no</th>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            {itemsData.length > 0 ? (
              <tbody>
                {itemsData.map((item) => {
                  return (
                    <tr key={item.productId}>
                      <td>{item.productId} </td>
                      <td>{item.itemName} </td>
                      <td>{item.itemQty}</td>
                      <td>₹ {item.unitPrice}</td>
                      <td>₹ {item.itemQty * item.unitPrice}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan="4" align="right">
                    Total
                  </td>
                  <td>₹ {props.total}</td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="5">No data found</td>
                </tr>
              </tbody>
            )}
          </Table>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default OrderDetails;
