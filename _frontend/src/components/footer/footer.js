import styled from "styled-components/macro";
const Card =  styled.div`
  .header_content_main{
    width: 40%;
    min-width: 50px;
    position: absolute;
    left: 50%;
    top: 0px;
    transform: translateX(-50%);
    z-index:2;
  }
  .header-container{
    position: absolute;
    top: 100vh;
    left: 0;
    right: 0;
    text-align: center;
    font-weight: 400;
  }

  .header-content{
  }

  .title1{
    margin-right: 40px;
    font-size: 25px;
    text-decoration: none;
    color:#fff;
  }

  .title2{
    font-size: 25px;
    text-decoration: none;
    color:#fff;
  }

`
const Footer = () => {
	return(
    <Card>
      </Card>
  )
}

export default Footer
