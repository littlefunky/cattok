import styled from "styled-components/macro";

export const MainBody = styled.div`
  margin: auto;
  width: 850px;
  max-width: 100%;
  justify-content: space-between;
  display: flex;
  flex: 1 1 auto;
  padding-top: 95px;
  @media (max-width: 900px) {
    width: 100%;
    padding: 4px;
    padding-top: 95px;
  }
`;

export const Mainmenu = styled.div`
  position: relative;
  flex: 0 0 300px;
  @media (max-width: 900px) {
    flex: 0 0 50px;
  }
`;

export const Feed = styled.div`
  ::-webkit-scrollbar {
    display: none;
  }
  width: auto;
  position: fixed;
  top: 95px;
  overflow-y: auto;
  left: unset;
  bottom: 0;
  align-items: stretch;
  height: auto;
`;

export const MenuContent = styled.div`
  ::-webkit-scrollbar {
    display: none;
  }
  width: 300px;
  position: fixed;
  top: 95px;
  overflow-y: auto;
  left: unset;
  bottom: 0;
  align-items: stretch;
  height: auto;
  @media (max-width: 900px) {
    width: 50px;
  }
`;

export const Menuresponsive = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: auto;
  @media (max-width: 900px) {
    display: none;
    display: unset;
  }
`;

export const TextresponsiveNormal = styled.div`
  font-size: calc(0.4em + 1vmin);
  color: #fff;
  @media (max-width: 900px) {
    display: none;
  }
`;

export const TextresponsiveSmall = styled.div`
  font-size: calc(0.3em + 1vmin);
  color: #fff;
  @media (max-width: 900px) {
    display: none;
  }
`;

export const TextresponsiveNotcolor = styled.div`
  font-size: calc(0.5em + 1vmin);
  @media (max-width: 900px) {
    display: none;
  }
`;

export const MainContent = styled.div`
  padding: 24px 0;
  color: #fff;
  max-width: 692px;
  width: calc((100vw - 40px) - 68px);
  @media (max-width: 900px) {
    width: calc((100vw - 32px) - 68px);
  }
`;
export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 10px;
  padding-left: 10px;
`;

export const NameUser = styled.div`
  font-size: 15px;
`;

export const Button = styled.a`
  padding: 5px;
  font-weight: 700;
  margin-left: 8px;
  font-size: 18px;
  line-height: 32px;
  color: #fff;
  display: flex;
`;

export const Active = styled.b`
  color: rgb(254, 44, 85);
  padding: 5px;
  grid-column: 1;
  font-weight: 700;
  margin-left: 8px;
  font-size: 18px;
  line-height: 32px;
  display: flex;
`;

export const Icon = styled.b`
  grid-colume: 1;
  margin-right: 10px;
`;

export const Info = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  height: 50px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 4px;
  color: #fff;
  margin-bottom: 10px;

  @media (max-width: 900px) {
    margin-bottom: 0px;
  }
`;

export const Profile = styled.img`
  height: 35px;
  width: 35px;
  margin-left: 16px;
  border-radius: 100%;
  @media (max-width: 900px) {
    margin-left: 6px;
  }
`;

export const ProfileFeed = styled.img`
  width: 100%;
  border-radius: 100%;
  grid-row: 1;
  grid-column: 1;
`;

export const FeedInfoUser = styled.div`
  padding-left: 10px;
  grid-column: 2;
  grid-row: 1;
  font-size: calc(0.5em + 1vmin);
`;

export const FeedItem = styled.div`
  max-width: 600px;
  position: relative;
  padding: 20px 0px;
  display: grid;
  grid-template-columns: 10% 45% 50px;
  gap: 2% 0px;
  border-bottom: 1px solid #524f4f;

  @media (max-width: 790px) {
    grid-template-columns: 10% 1fr 50px;
  }
`;
export const SizefontInfoUser = styled.div`
  font-size: calc(0.3em + 1vmin);
`;

export const Video = styled.img`
  object-fit: cover;
  border-radius: 20px;
  width: 100%;
  grid-column: 2;
  font-size: 13px;
`;

export const VideoFeedItem = styled.div`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: repeat(auto-fit, 39px 20px);
  text-align: -webkit-center;
  padding: 5px;
`;

export const FeedItemSize = styled.a`
  font-size: calc(0.75em + 1vmin);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  &:hover {
    background: #4b4746;
    border-radius: 100%;
  }
`;

export const SizeFontItenFeed = styled.div`
  font-size: calc(0.3em + 1vmin);
`;
