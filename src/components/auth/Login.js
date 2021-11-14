import React, { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";

import "./Login.css";

const Login = () => {
    const [userName, setUserName] = useState(null);
    const [password, setPassword] = useState(null);

    let user = { userType: 0, isLoggedIn: false };
    console.log(user);

    const setLogin = () => {
        if (userName === "admin" && password === "admin@2021") {
            user = { userType: 1, isLoggedIn: true };
        }
        localStorage.setItem("isLoggedIn", user.isLoggedIn);
        localStorage.setItem("userType", user.userType);
        window.location.reload(false);
    };

    return (
        <div className="my_card">
            <div className="Heading">MINISHO | Login</div>
            <div className="card_1">
                <div>
                    <div class="Wrapper">
                        <p className="my_p">Sign in to start your session</p>
                        <label for="inputEmail4" class="form-label"></label>
                        <input
                            type="text"
                            class="form-control my_css"
                            id="userName"
                            placeholder="User name"
                            onChange={(e) => {
                                setUserName(e.target.value);
                            }}
                        />
                    </div>
                    <div class="">
                        <label for="inputPassword4" class="form-label"></label>
                        <input
                            type="password"
                            class="form-control"
                            id="inputPassword4"
                            placeholder="Password"
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                        />
                    </div>
                    <div class="flex my_css">
                        <div class="">
                            <button
                                type="submit"
                                class="btn btn-primary"
                                onClick={setLogin}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
