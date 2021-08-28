import react, { useState } from "react";
import { ModalLogin } from "../../components/modal/ModalLogin";
import {
  ReactRouterLink,
  ReactRouterLinkMain,
  Logo,
  Profile,
  Icon,
  MenuRight,
  Form,
  Input,
  LineSearch,
  IconSearch,
} from "./styles/header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowAltCircleDown,
  faBell,
} from "@fortawesome/free-regular-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const Header = ({ direction = "row" }) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal((prev) => !prev);
  };

  const submit = async (event) => {
    event.preventDefault();

    const user_id = "611c0e0823f600ae6225affa";
    const URL = `http://localhost:3000/v1/user/${user_id}`;

    await fetch(URL)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  };
  return (
    <ReactRouterLinkMain>
      <ModalLogin showModal={showModal} setShowModal={setShowModal} />
      <ReactRouterLink direction={direction}>
        <Logo
          src="https://sf16-scmcdn-sg.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-whole-c555aa707602e714ec956ac96e9db366.svg"
          alt="Logo"
        />
        <Form action="#" onSubmit={submit}>
          <Input type="text" placeholder="Search accounts" name="user_id" />
          <LineSearch />
          <IconSearch>
            <FontAwesomeIcon icon={faSearch} />
          </IconSearch>
        </Form>
        <MenuRight>
          <Icon>
            <FontAwesomeIcon icon={faArrowAltCircleDown} />
          </Icon>
          <Icon>
            <FontAwesomeIcon icon={faBell} />
          </Icon>
          <div onClick={openModal}>
            <Profile
              src="https://avatars.githubusercontent.com/u/45877158?v=4"
              alt="Profile"
            />
          </div>
        </MenuRight>
      </ReactRouterLink>
    </ReactRouterLinkMain>
  );
};

export default Header;
