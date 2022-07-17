import http from "http";
import express from "express";
// import WebSocket from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

//pug사용
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
//정적파일 등록
app.use("/public", express.static(__dirname + "/public"));
// "/" url만 사용할 수 있도록 설정
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

//http server위에 wss를 만든다.
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

/* 
    webRTC(web real-time communication)
*/
wsServer.on("connection", (socket) => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
