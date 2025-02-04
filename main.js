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
            voiceRos: null
        };
    },
    methods: {
          connect() {
            this.ros = new ROSLIB.Ros({
                url: this.ws_address
            });
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
            localStorage.setItem('connected', JSON.stringify(this.connected));
            localStorage.setItem('ws_address', this.ws_address);
            localStorage.setItem('logs', JSON.stringify(this.logs));
        },
        setTopic() {
            this.topic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/cmd_vel',
                messageType: 'geometry_msgs/Twist'
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
            this.voiceTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/voiceTopic',
                messageType: 'std_msgs/String'
            });
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
            const imageTopic = new ROSLIB.Topic({
                ros: this.ros,
                name: '/camera/image_raw/compressed', // Tên topic mà camera phát
                messageType: 'sensor_msgs/msg/CompressedImage'
            });
            this.logs.unshift('UpdateCamera.');
            imageTopic.subscribe((message) => {
                const img = new Image();
                img.src = 'data:image/jpeg;base64,' + message.data; // Chuyển đổi dữ liệu thành base64
                document.getElementById('camera-view').innerHTML = ''; // Xóa nội dung cũ
                document.getElementById('camera-view').appendChild(img); // Thêm hình ảnh mới
            });
        }
    }
})

app.mount('#app');
}