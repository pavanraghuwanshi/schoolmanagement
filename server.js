// const express = require("express");
// const app = express();
// require("dotenv").config();
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const http = require('http'); // Import HTTP to create server
// const { setIO } = require('./socket/socket'); // Import the socket module
// const socketIo = require('socket.io');
// const { onUserConnect, onUserDisconnect } = require("./utils/notificationWebSocket");

// // Initialize the database connection
// require("./db/db");

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Define the port to use
// const PORT = process.env.PORT || 3000;

// // Socket Initialization
// const server = http.createServer(app);
// const io = socketIo(server, { cors: { origin: '*' } }); 
// setIO(io); 

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   socket.on('registerBranch', (branchId) => {
//     console.log(`School ${branchId} subscribed to notifications`);
//     onUserConnect(socket, branchId);
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected:', socket.id);
//     onUserDisconnect(socket);
//   });
// });

// // Import routes
// const childRoutes = require("./routes/childRoute");
// const driverRoutes = require("./routes/driverRoute");
// const supervisorRoutes = require("./routes/supervisorRoute");
// const requestRoutes = require('./routes/requestRoute');
// const schoolRoutes = require('./routes/schoolRoute');
// const geofence = require('./routes/geofenceRoute');
// const superAdminRoutes = require('./routes/superAdminRoute')
// const branchRoute = require('./routes/branchRoute');

// // Use routes
// app.use("/parent", childRoutes);
// app.use("/driver", driverRoutes);
// app.use("/supervisor", supervisorRoutes);
// app.use('/request', requestRoutes);
// app.use('/geofence', geofence);
// app.use('/school', schoolRoutes);
// app.use("/superadmin", superAdminRoutes);
// app.use("/branch", branchRoute);

// // Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });
// // Start the server
// server.listen(PORT, () => {
//   console.log(`Server is running on PORT ${PORT}`);
// });

// // Root route to confirm backend setup
// app.get('/', (req, res) => {
//   res.json({
//     message: "Backend is set up in DevOps",
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

            console.log();
            

// twesgfbgfnh
const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require('http'); // Import HTTP to create server
const { setIO, getLiveData } = require('./socket/socket'); // Import the socket module
const socketIo = require('socket.io');
const { onUserConnect, onUserDisconnect } = require("./utils/notificationWebSocket");
const axios = require('axios');
const { ab } = require("./utils/alertsforwebapp");
// Initialize the database connection
require("./db/db");


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Define the port to use
const PORT = process.env.PORT || 3000;

// Socket Initialization
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
setIO(io);

io.on('connection', (socket) => {
  let singleDeviceInterval;
  console.log('A user connected:', socket.id);
  ab(io,socket)

  // Live Tracking Data
  socket.on('deviceId', (deviceId) => {
    // const getLiveData = (deviceId, singleDeviceInterval) => {

    const userr = "schoolmaster";
    const pass = "123456";

    targetDeviceId = Number(deviceId);
    console.log("data type", typeof deviceId, deviceId);

    // fetch single device data instant for first time
    if (targetDeviceId != null) {
      let devicelist = null;
      let devicelistFromAPI = {
        category: "",
        status: "",
        lastUpdate: "",
        name: "",
      };
      (async function () {
        // const url = "http://104.251.212.84/api/devices";
        const url = "https://rocketsalestracker.com/api/devices";
        const username = userr;
        const password = pass;

        try {
          const response = await axios.get(url, {
            auth: { username: username, password: password },
          });
          devicelist = response.data;
          devicelistFromAPI = devicelist.find(
            (device) => device.id === targetDeviceId
          );
          // console.log(devicelistFromAPI);

          // console.log('API response data:', devicelist);
        } catch (error) {
          console.error("Error fetching data from API:", error);
        }
      })();
      // console.log("deviceId", typeof targetDeviceId, targetDeviceId)

      // in this setinterval i am emiting event
      (async function () {
        // const url = "http://104.251.212.84/api/positions";
        const url = "https://rocketsalestracker.com/api/positions";
        const username = userr;
        const password = pass;

        try {
          const response = await axios.get(url, {
            auth: { username: username, password: password },
          });
          const data = response.data;
          // console.log("data from GPS device ", data)
          // console.log("BBBBBBBBBBB")

          const device = data.find(
            (device) => device.deviceId === targetDeviceId
          );
          console.log("device", device)
          if (device) {
            const dataForSocket = {
              speed: device.speed,
              longitude: device.longitude,
              latitude: device.latitude,
              course: device.course,
              deviceId: device.deviceId,
              deviceTime: device.deviceTime,
              // ignition: device.attributes.ignition,
              // distance: device.attributes.distance,
              // totalDistance: device.attributes.totalDistance,
              // event: device.attributes.event,
              attributes: device.attributes,
              category: devicelistFromAPI.category,
              status: devicelistFromAPI.status,
              lastUpdate: devicelistFromAPI.lastUpdate,
              name: devicelistFromAPI.name,
              uniqueId: devicelistFromAPI.uniqueId,
            };
            socket.emit("single device data", dataForSocket);
            console.log("single device data");
            
          }
        } catch (error) {
          console.error(
            "There was a problem with the fetch operation:",
            error.message
          );
        }
      })();
    }

    singleDeviceInterval = setInterval(() => {
      if (targetDeviceId != null) {
        // this is for devices start
        let devicelist = null;
        let devicelistFromAPI = {
          category: "",
          status: "",
          lastUpdate: "",
          name: "",
        };
        // setInterval(() => {
        (async function () {
          // const url = "http://104.251.212.84/api/devices";
          const url = "https://rocketsalestracker.com/api/devices";
          const username = userr;
          const password = pass;

          try {
            const response = await axios.get(url, {
              auth: { username: username, password: password },
            });
            devicelist = response.data;
            devicelistFromAPI = devicelist.find(
              (device) => device.id === targetDeviceId
            );

            // console.log('API response data:', devicelist);
          } catch (error) {
            console.error("Error fetching data from API:", error);
          }
        })();
        // console.log("deviceId", typeof targetDeviceId, targetDeviceId)
        // }, 10000);
        // this is for devices end

        // in this setinterval i am emiting event
        // setInterval(() => {
        (async function () {
          // const url = "http://104.251.212.84/api/positions";
          const url = "https://rocketsalestracker.com/api/positions";
          const username = userr;
          const password = pass;

          try {
            const response = await axios.get(url, {
              auth: { username: username, password: password },
            });
            const data = response.data;
            // console.log("data from GPS device ",data)
            // console.log("BBBBBBBBBBB")

            const device = data.find(
              (device) => device.deviceId === targetDeviceId
            );
            // console.log("device",device)
            if (device) {
              const dataForSocket = {
                speed: device.speed,
                longitude: device.longitude,
                latitude: device.latitude,
                course: device.course,
                deviceId: device.deviceId,
                deviceTime: device.deviceTime,
                attributes: device.attributes,
                category: devicelistFromAPI.category,
                status: devicelistFromAPI.status,
                lastUpdate: devicelistFromAPI.lastUpdate,
                name: devicelistFromAPI.name,
                uniqueId: devicelistFromAPI.uniqueId,
                // ignition: device.attributes.ignition,
                // distance: device.attributes.distance,
                // totalDistance: device.attributes.totalDistance,
                // event: device.attributes.event,
              };
              console.log("single device data");
              socket.emit("single device data", dataForSocket);
              // console.log(
              //   "SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
              // );
            }
          } catch (error) {
            console.error(
              "There was a problem with the fetch operation:",
              error.message
            );
          }
        })();
        // }, 10000);
      }
    }, 10000);
    // }
  });

  socket.on('registerBranch', (branchId) => {
    console.log(`School ${branchId} subscribed to notifications`);
    onUserConnect(socket, branchId);
  });


socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    onUserDisconnect(socket);
    clearInterval(singleDeviceInterval);
  });
});

// Import routes
const childRoutes = require("./routes/childRoute");
const driverRoutes = require("./routes/driverRoute");
const supervisorRoutes = require("./routes/supervisorRoute");
const requestRoutes = require('./routes/requestRoute');
const schoolRoutes = require('./routes/schoolRoute');
const geofence = require('./routes/geofenceRoute');
const superAdminRoutes = require('./routes/superAdminRoute')
const branchRoute = require('./routes/branchRoute');
const device = require("./models/device");
const branchGroupUserRoute = require('./routes/branchgroupuserRoute');
const getalert = require('./routes/reportsRoute');


// Use routes
app.use("/parent", childRoutes);
app.use("/driver", driverRoutes);
app.use("/supervisor", supervisorRoutes);
app.use('/request', requestRoutes);
app.use('/geofence', geofence);
app.use('/school', schoolRoutes);
app.use("/superadmin", superAdminRoutes);
app.use("/branch", branchRoute);
app.use("/branchgroupuser", branchGroupUserRoute);
app.use("/", getalert);


// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

// Root route to confirm backend setup
app.get('/', (req, res) => {
  res.json({
    message: "Backend is set up in DevOps",
    environment: process.env.NODE_ENV || 'development'
  });
}); 
