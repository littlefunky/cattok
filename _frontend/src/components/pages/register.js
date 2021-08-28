import React, { useState } from "react";
import styled from "styled-components";

const Mainregister = styled.div`
  color: #fff;
`;

const Register = () => {
  const [selectedFile, setSelectedFile] = useState();

  const changeHandler = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const submit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("name", document.querySelector("#name").value);
    formData.append("email", document.querySelector("#email").value);
    formData.append("password", document.querySelector("#password").value);

    const REGISTER_URL = "http://localhost:3000/v1/user";
    const opt = {
      method: "POST",
      body: formData,
      credentials: "include",
    };
    await fetch(REGISTER_URL, opt)
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
      });
  };

  return (
    <Mainregister>
      <form onSubmit={submit}>
        <label>
          Name
          <input id="name" type="text" name="name" required />
          Email
          <input id="email" type="email" name="email" required />
          Password
          <input id="password" type="password" name="password" required />
          Photo
          <input
            onChange={changeHandler}
            id="photo"
            type="file"
            name="Photo"
            required
          />
          <input type="submit" name="submit" />
        </label>
      </form>
    </Mainregister>
  );
};

export default Register;
