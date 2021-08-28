import React, { useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import styled from "styled-components";

const Background = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  margin-top: -15px;
`;

const ModalWrapper = styled.div`
  width: 472px;
  height: 330px;
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.2);
  background: #fff;
  color: #000;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 55px;
  position: relative;
  z-index: 10;
  border-radius: 10px;
`;

const Container = styled.div`
  flex: 1;
  width: 472px;
  margin: 0 auto;
  padding: 0 48px;
  box-sizing: border-box;
  margin-top: 50px;
  overflow-y: auto;
  font-size: 14px;
  color: #161823;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Fontsize = styled.div`
  font-size: calc(1em + 1vmin);
  margin-bottom: 20px;
`;

const BackgroundInput = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 10px;
  background: rgba(22, 24, 35, 0.06);
  border-radius: 92px;
  position: relative;
  overflow: hidden;
`;

const Input = styled.input`
  padding: 8px 16px;
  background: rgba(22, 24, 35, 0.06);
  position: relative;
  overflow: hidden;
  font-weight: 400;
  font-size: 16px;
  line-height: 22px;
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
  width: 292px;
  appearance: textfield;
`;

const Image = styled.img`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: inline-flex;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(22, 24, 35, 0.06);
  transition: all 200ms ease-in-out 0s;
`;

const Footer = styled.div`
  border-top: 0.5px solid rgba(22, 24, 35, 0.12);
  padding: 14px;
`;

const queryClient = new QueryClient();

export const ModalLogin = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Modal />
    </QueryClientProvider>
  );
};

const Modal = ({ showModal, setShowModal }) => {
  const modalRef = useRef();

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      setShowModal(false);
    }
  };

  const [input, setInput] = useState({
    email: "",
    pasword: "",
  });

  const Change = (e) => {
    const newInput = { ...input };
    newInput[e.target.id] = e.target.value;
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
    <>
      {showModal ? (
        <Background onClick={closeModal} ref={modalRef}>
          <ModalWrapper showModal={showModal}>
            <Image
              onClick={() => setShowModal((prev) => !prev)}
              src="https://sf16-scmcdn-sg.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/close_gray-30d27359308dde2232cbef8dfa96163d.svg"
            />
            <Container>
              <Fontsize>Login to Cattok</Fontsize>
              <form onSubmit={submit}>
                <BackgroundInput>
                  <Input
                    onChange={(e) => Change(e)}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="email"
                  />
                </BackgroundInput>
                <BackgroundInput>
                  <Input
                    onChange={(e) => Change(e)}
                    id="password"
                    type="password"
                    name="password"
                    placeholder="password"
                  />
                </BackgroundInput>
                <BackgroundInput>
                  <Input type="submit" name="submit" value="Login" />
                </BackgroundInput>
              </form>
            </Container>
            <Footer>Already have an account? Sign Up</Footer>
          </ModalWrapper>
        </Background>
      ) : null}
    </>
  );
};
