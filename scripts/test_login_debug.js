const axios = require('axios');

async function testLogin() {
    try {
        console.log("Testing Login...");
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'joan2006vg22@gmail.com',
            password: '31240289'
        });
        console.log("Response Status:", response.status);
        console.log("Response Data:", response.data);
    } catch (error) {
        if (error.response) {
            console.error("Server Error Response Status:", error.response.status);
            console.error("Server Error Response Data:", JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error("No response received (Server might be down or not reachable)");
        } else {
            console.error("Error setting up request:", error.message);
        }
    }
}

testLogin();
