import react, { useState } from "react";
import { QueryClientProvider, useQuery } from "react-query";
import ReactPlayer from "react-player";
import { queryClient } from "../../index.js";
import {
  Mainmenu,
  MainBody,
  MainContent,
  Menuresponsive,
  MenuContent,
  TextresponsiveNormal,
  TextresponsiveNotcolor,
  TextresponsiveSmall,
  SizefontInfoUser,
  Icon,
  Info,
  Profile,
  ProfileFeed,
  SizeFontItenFeed,
  UserInfo,
  VideoFeedItem,
  Button,
  Feed,
  FeedInfoUser,
  FeedItem,
  FeedItemSize,
  Active,
} from "./styles/content.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faVideo,
  faHeart,
  faCommentDots,
  faShare,
} from "@fortawesome/free-solid-svg-icons";

const Content = () => {
  const URL = "http://localhost:3000/v1";
  const ASSET = "http://localhost:3000";

  const fetchPosts = async () => {
    const posts = await fetch(URL + "/post").then((res) => res.json());
    const User = await Promise.all(
      posts.data.map(async (post) => ({
        ...post,
        user: await queryClient.fetchQuery(
          ["user", post.user_id],
          ({ queryKey }) =>
            fetch(URL + "/user/" + queryKey[1])
              .then((res) => res.json())
              .then((json) => json.data)
        ),
      }))
    );

    return User;
  };

  function Windows() {
    const { data, error, isLoading } = useQuery("getPosts", fetchPosts);

    if (isLoading) return "Loading...";
    if (error) return "An error has occurred" + error.message;

    console.log(data);
    return (
      <Feed>
        {data.map((video) => (
          <FeedItem key={video.id}>
            <ProfileFeed src={ASSET + video.user.photo} alt="profile" />
            <FeedInfoUser>
              <div>{video.user.name}</div>
              <SizefontInfoUser>
                {video.title}
                <div>{video.description}</div>
              </SizefontInfoUser>
            </FeedInfoUser>
            <ReactPlayer
              url={ASSET + video.video_url}
              width="100%"
              height="100%"
              style={mystyle}
              playing={true}
              controls
            />
            <VideoFeedItem>
              <FeedItemSize>
                <FontAwesomeIcon icon={faHeart} />
              </FeedItemSize>
              <SizeFontItenFeed>{"12.5k"}</SizeFontItenFeed>
              <FeedItemSize>
                <FontAwesomeIcon icon={faCommentDots} />
              </FeedItemSize>
              <SizeFontItenFeed>{"242"}</SizeFontItenFeed>
              <FeedItemSize>
                <FontAwesomeIcon icon={faShare} />
              </FeedItemSize>
              <SizeFontItenFeed>{"1k"}</SizeFontItenFeed>
            </VideoFeedItem>
          </FeedItem>
        ))}
      </Feed>
    );
  }

  const mystyle = {
    objectFit: "cover",
    borderRadius: "20px",
    width: "100%",
    gridColumn: "2",
    fontSize: "13px",
  };
  return (
    <MainBody>
      <Mainmenu>
        <MenuContent>
          <Menuresponsive>
            <Active>
              <Icon>
                <FontAwesomeIcon icon={faHome} />
              </Icon>
              <TextresponsiveNotcolor>For You</TextresponsiveNotcolor>
            </Active>
            <Button>
              <Icon>
                <FontAwesomeIcon icon={faUsers} />
              </Icon>
              <TextresponsiveNormal>Following</TextresponsiveNormal>
            </Button>
            <Button>
              <Icon>
                <FontAwesomeIcon icon={faVideo} />
              </Icon>
              <TextresponsiveNormal>LIVE</TextresponsiveNormal>
            </Button>
          </Menuresponsive>
          <TextresponsiveNormal>Suggester accounts</TextresponsiveNormal>
          <Info>
            <Profile src="" alt="Profile" />
            <UserInfo>
              <TextresponsiveNormal>{"Kongthap"}</TextresponsiveNormal>
              <TextresponsiveSmall>{"I'm a wab developer"}</TextresponsiveSmall>
            </UserInfo>
          </Info>
          <TextresponsiveNormal>Following accounts</TextresponsiveNormal>
          <Info>
            <Profile src="" alt="Profile" />
            <UserInfo>
              <TextresponsiveNormal>{"Kongthap"}</TextresponsiveNormal>
              <TextresponsiveSmall>{"I'm a wab developer"}</TextresponsiveSmall>
            </UserInfo>
          </Info>
        </MenuContent>
      </Mainmenu>
      <MainContent>
        <Windows />
      </MainContent>
    </MainBody>
  );
};
export default Content;
