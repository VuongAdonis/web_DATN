function controlInit() {
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            connected: JSON.parse(localStorage.getItem('connected')) || false,
            ros: null,
            logs: JSON.parse(localStorage.getItem('logs')) || [],
            topic: null,
            message: null,
            ws_address: localStorage.getItem('ws_address') || 'ws://localhost:9090',
            voiceOn: true,

            voiceTopic: null,
            featureTopic: null,
            batteryTopic: null,
            imageTopic: null,

            voiceActive: false,
            faceAtive: false,
            gestureActive: false,
            colorActive: false,
            trackingActive: false,
            selectedColor: "green",

            voiceRos: null,
            showFaceOptions: false,
            showColorOptions: false,
            showGestureResult: false,
            gestureResult: '',
            selectedColorOption: '',
            activeFeature: false,
            activeTracking: false,
            batteryLevel: '--'
        };
    },
    methods: {
          connect() {
            this.ros = new ROSLIB.Ros({
                url: this.ws_address
            });
            
            console.log("ros attribute: ", this.ros)
            this.setTopic();
            this.subscribeToCamera();

            this.ros.on('connection', () => {
                this.connected = true;
                this.logs.unshift('Connected to websocket server.');
                this.saveState();
            });

            this.ros.on('error', (error) => {
                this.connected = false;
                this.logs.unshift('Error connecting to websocket server: ', error);
                this.saveState();
            });

            this.ros.on('close', () => {
                this.connected = false;
                this.logs.unshift('Connection to websocket server closed.');
                this.saveState();
                this.disconnect()
            });
        },
        disconnect() {
            if (this.ros) {
                this.ros.close();
                this.connected = false;
                this.logs.unshift('Disconnected from websocket server.');
                this.saveState();
                // window.location.href = 'startPage.html';
            }
        },
        saveState() {
            // localStorage.setItem('connected', JSON.stringify(this.connected));
            // localStorage.setItem('ws_address', this.ws_address);
            localStorage.setItem('logs', JSON.stringify(this.logs));
            // localStorage.setItem('ros', JSON.stringify(this.ros));
        },
        setTopic() {
            this.topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            });

            this.featureTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/featureTopic',
                messageType: 'std_msgs/String'
            });
            this.colorTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: 'colorChoice', // Tên topic mà camera phát
                messageType: 'std_msgs/String'
            });
            this.voiceTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/voiceTopic',
                messageType: 'std_msgs/String'
            });
            this.imageTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/camera/image_raw/compressed', // Tên topic mà camera phát
                messageType: 'sensor_msgs/msg/CompressedImage'
            });
            this.batteryTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: 'batteryTopic', // Tên topic mà camera phát
                messageType: 'std_msgs/String'
            });
        },
        forward() {
            this.message = new ROSLIB.Message({
                linear: { x: 1, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0, },
            });
            this.setTopic();
            this.topic.publish(this.message);
            this.logs.unshift('Command move forward.');
        },
        stop() {
            this.message = new ROSLIB.Message({
                linear: { x: 0, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0, },
            });
            this.setTopic();
            this.topic.publish(this.message);
            this.logs.unshift('Command move stop.');
        },
        turnLeft() {
            this.message = new ROSLIB.Message({
                linear: { x: 0.5, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0.5, },
            });
            this.setTopic();
            this.topic.publish(this.message);
            this.logs.unshift('Command move turnLeft.');
        },
        turnRight() {
            this.message = new ROSLIB.Message({
                linear: { x: 0.5, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: -0.5, },
            });
            this.setTopic();
            this.topic.publish(this.message);
            this.logs.unshift('Command move turnRight.');
        },
        backward() {
            this.message = new ROSLIB.Message({
                linear: { x: -1, y: 0, z: 0, },
                angular: { x: 0, y: 0, z: 0, },
            });
            this.setTopic();
            this.topic.publish(this.message);
            this.logs.unshift('Command move backward.');
        },
        onVoice() {
            this.voiceOn = false
            this.logs.unshift('Connected to Voice topic.');
            const voiceMesg = {
                data: "on"  // Định dạng lại tin nhắn theo kiểu JSON để bao gồm trường "data"
            };
            this.voiceTopic.publish(voiceMesg);
        },
        offVoice() {
            const voiceMesg = {
                data: "off"  // Định dạng lại tin nhắn theo kiểu JSON để bao gồm trường "data"
            };
            this.voiceOn = true
            this.logs.unshift('Turn off Voice topic.');
            this.voiceTopic.publish(voiceMesg);
        },
        subscribeToCamera() {
            
            this.logs.unshift('UpdateCamera.');
            this.imageTopic.subscribe((message) => {
                const img = new Image();
                img.src = 'data:image/jpeg;base64,' + message.data; // Chuyển đổi dữ liệu thành base64
                document.getElementById('camera-view').innerHTML = ''; // Xóa nội dung cũ
                document.getElementById('camera-view').appendChild(img); // Thêm hình ảnh mới
            });
        },
        subscribeToBattery() {
            
            this.logs.unshift('Update Battery.');
            this.batteryTopic.subscribe((message) => {
                this.batteryLevel = message.data;
            });
        },
        saved() {

        },
        add() {

        },
        pickColor() {

        },
        hsv() {

        },
        tracking() {
            // this.activeTracking = !this.activeTracking;
            if( this.activeTracking === false ) {
                this.logs.unshift('Tracking color.');
                const trackingMesg = {
                    data: "tracking"  // Định dạng lại tin nhắn theo kiểu JSON để bao gồm trường "data"
                };
                this.colorTopic.publish(trackingMesg);
                this.activeTracking = true
            }
            else{
                this.logs.unshift('Stop tracking.');
                const trackingMesg = {
                    data: "untracking"  // Định dạng lại tin nhắn theo kiểu JSON để bao gồm trường "data"
                };
                this.colorTopic.publish(trackingMesg);
                this.activeTracking = false
            }
        },
        gesture() {
            this.showGestureResult = ! this.showGestureResult;
        },
        onColorChange() {
            // This function gets called whenever a radio button is selected.
            console.log(this.selectedColorOption); // Log the selected option
            // You can add additional logic here based on the selected option
            if (this.selectedColorOption === 'Pick Color') {
                // Call function for Pick Color
                console.log("Pick Color selected");
                // this.handlePickColor();
            } else if (this.selectedColorOption === 'HSV') {
                // Call function for HSV
                this.handleHSV();
            }

        },
        handlePickColor() {
            // Logic for handling Pick Color
            // console.log("Pick Color selected");
            this.logs.unshift('Choose ' + this.selectedColor + " color");
            const colorMesg = {
                data: this.selectedColor  // Định dạng lại tin nhắn theo kiểu JSON để bao gồm trường "data"
            };
            this.colorTopic.publish(colorMesg)
        },
        handleHSV() {
            // Logic for handling HSV
            console.log("HSV selected");
            // Add your code for handling the "HSV" action
        },
        sendFeatureMsg(feature) {
            this.logs.unshift('Connected to ' + feature + ' topic.');
            const featureMsg = {
                data: feature  // Định dạng lại tin nhắn theo kiểu JSON để bao gồm trường "data"
            };
            console.log('feature: ' + feature);
            if (feature !== ''){
                this.featureTopic.publish(featureMsg);
            }
            
        },
        activate(feature) {
            // Set the active feature and toggle options based on the feature activated
            if (this.activeFeature === feature) {
                this.activeFeature = '';
                this.showFaceOptions = false;
                this.showColorOptions = false;
                this.showGestureResult = false;
                this.sendFeatureMsg("offFeature");
                return;
            }
            this.activeFeature = feature;

            // Toggle Face Options
            if (feature === 'face') {
                this.showFaceOptions = !this.showFaceOptions;
                this.showColorOptions = false; // Hide Color options
                this.activeTracking = false;
                this.showGestureResult = false;
                this.sendFeatureMsg(feature);
            } 
            // Toggle Color Options
            else if (feature === 'color') {
                this.showColorOptions = !this.showColorOptions;
                this.showFaceOptions = false; // Hide Face options
                this.showGestureResult = false;
                this.sendFeatureMsg(feature);
            } 
            // If Gesture is clicked, ensure other options are closed
            else {
                this.showFaceOptions = false; // Hide Face options
                this.showColorOptions = false; // Hide Color options
                this.activeTracking = false;
                this.gesture();
                this.sendFeatureMsg(feature);
            }
        }
    }
})

app.mount('#app');
}