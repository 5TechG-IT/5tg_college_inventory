import React from "react";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";

// import CSS styles
import "./App.css";
import "datatables.net-dt/css/jquery.dataTables.min.css";

// import components
// import Login from "./components/user_authentication/Login";
import Main from "./components/main_dashboard/Main";

// import context
import { WorkerProvider } from "./contexts/workerContext";

function App() {
    return (
        <WorkerProvider>
            <Router>
                <div className="container-fluid m-0 p-0">
                    <Switch>
                        <Route path="/mainDashboard" exact component={Main} />
                        <Route path="/" component={Main} />
                    </Switch>
                </div>
            </Router>
        </WorkerProvider>
    );
}

export default App;

// testing
