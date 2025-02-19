function navInit() {
    const { createApp } = Vue;
    
    const app = createApp({
        data() {
            return {
              connected: JSON.parse(localStorage.getItem('connected')) || false,
              ros: JSON.parse(localStorage.getItem('ros')) || "abc",
              // ros: null,
              logs: JSON.parse(localStorage.getItem('logs')) || [],
              topic: null,
              message: null,
              ws_address: localStorage.getItem('ws_address') || 'ws://localhost:9090',
              voiceOn: true,
              connectedMap: false,

              occupancyGrid: null,
              mapTopic: null,
              poseTopic: null,
              viewer: null,
              gridClient: null,

              pose: null,
              canvas: null,
              context: null,
              imageData: null,

              viewerHeight: 300,
              viewerWidth: 500,

              width: null,
              height: null,
              scaleX: null,
              scaleY: null,
              bitmap: null,

              mapPositionX: null,
              mapPositionY: null,
              robotPositionX: null,
              robotPositionY: null,
              mapResolution: null,
              robotX: null,
              robotY: null,

              canvasElement: null,
              goalTopic: null
            };
        },
        methods: {
          connect2() {
            this.ros = new ROSLIB.Ros({
                url: this.ws_address
            });
            this.ros.on('connection', () => {
              this.connected = true;
              this.logs.unshift('Connected to websocket server.');
              // this.saveState();
            });

            this.ros.on('error', (error) => {
                this.connected = false;
                this.logs.unshift('Error connecting to websocket server: ', error);
                console.log("Error occur")
                // this.saveState();
            });

            this.ros.on('close', () => {
                this.connected = false;
                this.logs.unshift('Connection to websocket server closed.');
                console.log("Error close")
                // this.saveState();
            });
            this.connected=true;
            console.log("Connect")
            
            this.initNav()
          },
          connectPose() {
            this.connectPose = true
            this.poseTopic = new ROSLIB.Topic({
              ros: this.ros,
              name: 'pose', // Tên topic mà camera phát
              messageType: 'geometry_msgs/msg/PoseWithCovarianceStamped'
            });

            this.poseTopic.subscribe((message) => {
              if (!message) {
                console.log("Invalid message or message structure is incorrect");
                return; // Nếu không hợp lệ, thoát ra
              }
              else if (!message.pose) {
                console.log("Invalid message pose");
              }
              else if (!message.pose.pose.position) {
                console.log("Invalid message pose position");
              }
          
              console.log("pose message: ", message)
              this.robotPositionX = message.pose.pose.position.x
              this.robotPositionY = message.pose.pose.position.y
            });
            console.log("Connect to pose topic")
          },
          disconnect() {
              if (this.ros) {
                  this.ros.close();
                  this.connected = false;
                  // window.location.href = 'startPage.html';
              }
          },
          initNav() {
              // Connect to ROS.
              
              
              this.mapTopic = new ROSLIB.Topic({
                  ros: this.ros,
                  name: 'map_json', // Tên topic mà camera phát
                  messageType: 'std_msgs/String'
              });
              this.poseTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: 'pose', // Tên topic mà camera phát
                messageType: 'geometry_msgs/msg/PoseWithCovarianceStamped'
              });
              this.goalTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/goal_pose', // Tên topic mà camera phát
                messageType: 'geometry_msgs/PoseStamped'
              });
              // Create the main viewer.
              // this.viewer = new ROS2D.Viewer({
              //   divID : 'map',
              //   width : 500,
              //   height : 300
              // });

              // if (!this.viewer || typeof this.viewer.addChild !== 'function') {
              //   console.error('Viewer không được khởi tạo hoặc không có phương thức addChild');
              //   return;
              // }

              // console.log("Viewer:", this.viewer);
              // console.log("test Viewer:", this.viewer.scene);
              
              this.poseTopic.subscribe((message) => {
                if (!message) {
                  console.log("Invalid message or message structure is incorrect");
                  return; // Nếu không hợp lệ, thoát ra
                }
                else if (!message.pose) {
                  console.log("Invalid message pose");
                }
                else if (!message.pose.pose.position) {
                  console.log("Invalid message pose position");
                }
            
                console.log("pose message: ", message)
                this.robotPositionX = message.pose.pose.position.x
                this.robotPositionY = message.pose.pose.position.y
              });
              
              this.mapTopic.subscribe((message) => {
                // console.log("OccupanccyGrid: ", message)
                this.occupancyGrid = JSON.parse(message.data)
                console.log("OccupanccyGrid: ", this.occupancyGrid)
                // console.log("OccupanccyGrid data: ", this.occupancyGrid.data)
                // console.log("OccupanccyGrid width: ", this.occupancyGrid.info.width)
                // console.log("OccupanccyGrid height: ", this.occupancyGrid.info.height)
                // console.log("OccupanccyGrid resolution: ", this.occupancyGrid.info.resolution)
                // console.log("OccupanccyGrid origin: ", this.occupancyGrid.info.origin)
                
                this.mapPositionX = this.occupancyGrid.info.origin.position.x
                this.mapPositionY = this.occupancyGrid.info.origin.position.y
                this.mapResolution = this.occupancyGrid.info.resolution
                // var message = JSON.parse(message.data);

                // internal drawing canvas
                // this.canvas = document.createElement('canvas');
                this.canvas = document.getElementById('myCanvas');
                
                this.context = this.canvas.getContext('2d');

                // save the metadata we need
                // this.pose = new ROSLIB.Pose({
                //   position : this.occupancyGrid.info.origin.position,
                //   orientation : this.occupancyGrid.info.origin.orientation
                // });

                // set the size
                this.width = this.occupancyGrid.info.width;
                this.height = this.occupancyGrid.info.height;
                this.canvas.width = this.width;
                this.canvas.height = this.height;

                // this.viewer.width = this.width;
                // this.viewer.height = this.height;

                this.imageData = this.context.createImageData(this.width, this.height);
                for ( var row = 0; row < this.height; row++) {
                  for ( var col = 0; col < this.width; col++) {
                    // determine the index into the map data
                    var mapI = col + ((this.height - row - 1) * this.width);
                    // determine the value
                    var data = this.occupancyGrid.data[mapI];
                    var val;
                    // -1 = unknown
                    // 0  = free
                    // 100 = occupied
                    if (data === -1) {
                      val = 127;
                    } else if (data === 0) {
                      val = 255;
                    } else {
                      val = 0;
                    }
                    // val = 255;

                    // determine the index into the image data array
                    var i = (col + (row * this.width)) * 4;
                    // r
                    this.imageData.data[i] = val;
                    // g
                    this.imageData.data[++i] = val;
                    // b
                    this.imageData.data[++i] = val;
                    // a
                    this.imageData.data[++i] = 255;

                    // if(col < 100 && col > 90 && row < 100 && row > 90){
                    //   i = (col + (row * this.width)) * 4;
                    //   // r
                    //   this.imageData.data[i] = 255;
                    //   // g
                    //   this.imageData.data[++i] = 0;
                    //   // b
                    //   this.imageData.data[++i] = 0;
                    // }
                  }
                }
                
                // console.log("Create Image data success", this.imageData)
                this.context.putImageData(this.imageData, 0, 0);
                // console.log("Put Image data success")
                // create the bitmap
                // createjs.Bitmap.call(this, this.canvas);
                this.bitmap = new createjs.Bitmap(this.canvas);
                // console.log("bitmap success")
                // this.viewer.addObject(this.bitmap);
        
                // Change Y direction
                this.bitmap.y = -300;

                // console.log("y position: ", this.bitmap.y)
                // Scale the image
                this.bitmap.scaleX = this.viewerWidth/this.width;
                this.bitmap.scaleY = this.viewerHeight/this.height; 

                // Set the pose
                this.bitmap.x = 0;
                // this.bitmap.y += this.pose.position.y;
                // this.bitmap.x = 0;
                // this.bitmap.y = 0;
                // this.robotPositionX = -14.958;
                // this.robotPositionY = -12.16;
                // calculate the robotX and robotY
                this.robotX = Math.abs(Math.round((this.mapPositionX - this.robotPositionX)/this.mapResolution))
                this.robotY = Math.abs(Math.round((this.mapPositionY - this.robotPositionY)/this.mapResolution))
                console.log("mapPositionX: ", this.mapPositionX)
                console.log("mapPositionY: ", this.mapPositionY)
                console.log("mapResolution: ", this.mapResolution)
                console.log("positionX: ", this.robotX)
                console.log("positionY: ", this.robotY)
                console.log("Y convert: ", this.height - this.robotY)

                console.log("pose messageX: ", this.robotPositionX)
                console.log("pose messageY: ", this.robotPositionY)

                // Draw the robot position
                this.context.beginPath();
                // this.context.arc(this.robotX, this.robotY, 10, 0, Math.PI * 2); // Vẽ hình tròn
                this.context.arc(this.robotX, this.height - this.robotY, 5, 0, Math.PI * 2);
                this.context.fillStyle = "red"; // Màu đỏ
                this.context.fill();
                this.context.closePath();

                console.log("Connect to grid", this.bitmap)
              });
            },
            eventCanvas() {
              // this.canvasEvent = document.getElementById('myCanvas');
              console.log("canvas object: ", this.canvas)
              this.canvas.addEventListener("click", this.onClick, false);
            },  
            onClick(e) {
                const mouseX = e.clientX; // Tọa độ X
                const mouseY = e.clientY; // Tọa độ Y
                
                // Để tính toán tọa độ tương đối trên canvas
                const canvasRect = this.canvas.getBoundingClientRect();
                const relativeX = mouseX - canvasRect.left; // Tọa độ X tương đối
                const relativeY = mouseY - canvasRect.top;  // Tọa độ Y tương đối
  
                alert(`Event clicked at (${relativeX}, ${relativeY})`); // Hiển thị tọa độ nhấp
                console.log(`Event clicked at (${relativeX}, ${relativeY})`); // Ghi lại tọa độ trong console
  
                var resultX = 0
                var resultY = 0
  
                  var poseX = relativeX * this.mapResolution + this.mapPositionX
                  resultX = poseX
                  var poseY = (this.height - relativeY) * this.mapResolution + this.mapPositionY
                  resultY = poseY
                  
                console.log("robotX = ", this.robotPositionX)
                console.log("robotY = ", this.robotPositionY)
                console.log("poseX = ", resultX)
                console.log("poseY = ", resultY)

                const poseWithCovarianceStamped = new ROSLIB.Message({
                  header: {
                      stamp: { secs: Math.floor(Date.now() / 1000), nsecs: 0 }, // Thời gian (epoch)
                      frame_id: 'map'          // Khung tọa độ mà thông điệp thuộc về
                  },
                  pose: {
                          position: {
                              x: resultX,          // Thay đổi tọa độ x theo yêu cầu
                              y: resultY,          // Thay đổi tọa độ y theo yêu cầu
                              z: 0.0           // Thay đổi tọa độ z nếu cần
                          },
                          orientation: {
                              x: 0.0,          // Thành phần x của quaternion
                              y: 0.0,          // Thành phần y của quaternion
                              z: 0.0,          // Thành phần z của quaternion
                              w: 1.0           // Thành phần w của quaternion
                          }
                  }
              });
              this.goalTopic.publish(poseWithCovarianceStamped)
            }
      }
    })
    
    app.mount('#navApp');
    }