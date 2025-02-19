// function loadContent(url) {
//     fetch(url)
//         .then(response => response.text())
//         .then(html => {
//             document.getElementById("home").innerHTML = html;
//             // Có thể gọi các hàm khởi tạo khác nếu cần
            
//         })
//     .catch(err => console.log('Failed to fetch page: ', err));
// }

function initializeConnection() {
    const { createApp } = Vue;

    const app = createApp({
        data() {
            return {
                startVar: false,
                connected: JSON.parse(localStorage.getItem('connected')) || false,
                ws_address: localStorage.getItem('ws_address') || 'ws://localhost:9090',
                ros: localStorage.getItem('ros') || null,
                logs: JSON.parse(localStorage.getItem('logs')) || [],
            };
        },
        methods: {
            connect() {
                // this.ros = new ROSLIB.Ros({
                //     url: this.ws_address
                // });

                // this.ros.on('connection', () => {
                //     this.connected = true;
                //     this.logs.unshift('Connected to websocket server.');
                //     this.saveState();
                //     window.location.href = 'index.html';
                //     });
                this.connected = false;
                this.startVar = true;
                // this.logs.unshift('Connected to websocket server.');
                this.saveState();
                window.location.href = 'index.html';

                // this.ros.on('error', (error) => {
                //     this.connected = false;
                //     this.logs.unshift('Error connecting to websocket server: ', error);
                //     this.saveState();
                // });

                // this.ros.on('close', () => {
                //     this.connected = false;
                //     this.logs.unshift('Connection to websocket server closed.');
                //     this.saveState();
                // });
            },
            disconnect() {
                // if (this.ros) {
                //     this.ros.close();
                //     this.connected = false;
                //     this.logs.unshift('Disconnected from websocket server.');
                //     this.saveState();
                //     window.location.href = 'startPage.html';
                // }
            },
            saveState() {
                // localStorage.setItem('connected', JSON.stringify(this.connected));
                // localStorage.setItem('ws_address', this.ws_address);
                // localStorage.setItem('logs', JSON.stringify(this.logs));
                // localStorage.setItem('ros', JSON.stringify(this.ros));
                // localStorage.setItem('startVar', JSON.stringify(this.startVar));
            }
        }
    });

    if (document.getElementById('home')) {
        app.mount('#home');
    }
} 