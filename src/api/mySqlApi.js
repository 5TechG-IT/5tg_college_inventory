const mysql = require("mysql");
var pool = mysql.createPool({
    host: "103.108.220.128",
    port: "3306",
    user: "ubzrnkmd_college_inventory_admin",
    password: "?4zizNtwK@no",
    database: "ubzrnkmd_college_inventory",
});

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var cors = require("cors");

const mySqlApi = class {
    // fun: to execute query and return result through promise
    executeQuery(query) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                }

                // execute query
                try {
                    connection.query(query, function (err, result) {
                        connection.release();
                        if (err) reject(err);
                        else resolve(result);
                    });
                } catch (err) {
                    console.log("mysqlApi executeQuery error: ", err);
                }
            });
        });
    }
};

const mysqlapi = new mySqlApi();

app.use(cors());

app.use(bodyParser.json());

//handling requests
app.get("/", (req, res) => {
    res.send("mySQL api is running...");
});

app.post("/executeQuery", (req, res) => {
    mysqlapi
        .executeQuery(req.body.query)
        .then((result) => {
            console.log("success");
            res.status(200).send(result);
        })
        .catch((err) => {
            console.log("error: ", err);
            res.status(500).send(Error);
        });
});

// express JS listening port
const PORT = 5000;
// listening port
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
