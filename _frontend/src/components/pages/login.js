import React, { useState } from "react";
import styled from "styled-components";

const MainLogin = styled.div`
  color: #fff;
`;

const Login = () => {
  const [input, setInput] = useState({
    name: "",
    pasword: "",
  });

  const Change = (e) => {
    const newInput = { ...input };
    newInput[e.target.id] = e.target.value;
    console.log(newInput);
    setInput(newInput);
  };

  const submit = async (event) => {
    event.preventDefault();

    const LOGIN_URL = "http://localhost:3000/v1/login";
    const opt = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
      }),
      credentials: "include",
    };
    await fetch(LOGIN_URL, opt)
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
      });
  };

  return (
    <MainLogin>
      <form onSubmit={submit}>
        <label>
          email:
          <input
            onChange={(e) => Change(e)}
            id="email"
            type="email"
            name="email"
            required
          />
          password:
          <input
            onChange={(e) => Change(e)}
            id="password"
            type="password"
            name="password"
            required
          />
        </label>
        <input type="submit" value="Login" />
      </form>
      <a href="/authenticate/register">register</a>
    </MainLogin>
  );
};

export default Login;
