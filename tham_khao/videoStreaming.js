
// import React, { Component } from 'react';
// import {
//   CCard,
//   CCardHeader,
//   CCardBody
// } from '@coreui/react'




// class ImageStream extends Component {

//     constructor(props) {
//         super(props);
//       }


//   render() {

//     return (

//       <CCard style={{width: "100%", height: "100%"}}>
//       <CCardHeader>
//         <strong>Image Stream</strong>
//       </CCardHeader>
//       <CCardBody>
//         <img src={this.props.src} style={{width: "100%", height: "100%", objectFit: "contain"}}></img>
//       </CCardBody>
//     </CCard>


    

//     );
//   }
// }

// export { ImageStream };

<template>
  <div id="app">
    <ImageStream src="http://localhost:8080/stream?topic=/camera/image_raw" />
    <!-- Bạn có thể thay đổi src cho phù hợp -->
  </div>
</template>

<script>
import ImageStream from './components/ImageStream.vue'; // Đường dẫn tùy thuộc vào cấu trúc thư mục bạn sử dụng

export default {
  name: 'App',
  components: {
    ImageStream,
  },
};
</script>

<style>
/* CSS toàn cục cho ứng dụng */
</style>
