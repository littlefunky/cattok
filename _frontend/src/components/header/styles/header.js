import styled from "styled-components/macro";

export const ReactRouterLinkMain = styled.div`
  display: flex;
  justify-content: space-around;
  position: fixed;
  left: 0;
  top: 15px;
  right: 0;
  height: 60px;
  background: none;
  box-sizing: border-box;
  z-index: 1;

  @media (max-width: 1000px) {
    padding-left: 20px;
    padding-right: 24px;
  }
`;

export const MenuRight = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  display: flex;
`;

export const Icon = styled.div`
  font-size: 22px;
  margin-left: 18px;
`;

export const ReactRouterLink = styled.div`
  width: 100%;
  padding: 0;
  max-width: 1000px;
  background-color: #fff;
  padding-left: 20px;
  padding-right: 24px;
  box-sizing: border-box;
  display: flex;
  height: 100%;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 15px;
  color: #000;
  z-index: 1;

  @media (max-width: 1000px) {
    flex-direction: row;
  }
`;

export const Logo = styled.img`
  height: 42px;
  width: 118px;

  @media (min-width: 1449px) {
    height: 42px;
    width: 118px;
  }
`;

export const Profile = styled.img`
  height: 32px;
  width: 32px;
  margin-left: 16px;
  border-radius: 100%;
  @media (min-width: 1449px) {
  }
`;

export const DropdownContent = styled.div``;

export const DropdownItem = styled.div`
  position: relative;
  margin-left: 16px;
  background: #fff;
  border-radius: 15px;
  padding: 8px 0;
  min-width: 223px;
  transition: all 0.3s ease-in-out;
`;

export const Item = styled.a`
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  font-size: 16px;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  font-size: 16px;
  text-decoration: none;
`;
export const FontSizeDropdown = styled.div`
  margin-left: 20px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
  background: rgba(22, 24, 35, 0.06);
  border-radius: 92px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  @media (max-width: 800px) {
    display: none;
  }
`;

export const Input = styled.input`
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

export const LineSearch = styled.span`
  width: 1px;
  height: 28px;
  margin: -3px 0;
  background: rgba(22, 24, 35, 0.12);
`;

export const IconSearch = styled.div`
  padding: 11px 16px 11px 12px;
  margin: -12px -16px;
  margin-left: 0;
  font-size: 18px;
  cursor: pointer;
  outline: none;
  border: none;
  background: transparent;
  color: rgba(22, 24, 35, 0.12);
`;
