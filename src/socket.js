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

const handleListen = () => console.log(`Listening on http://localhost:3000`);

//http server위에 wss를 만든다.
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});

//socket admin ui 사용
instrument(wsServer, {
    auth: false,
});

//adapter
/*
https://runebook.dev/ko/docs/socketio/mongo-adapter
*/
//존재하는 room array
function publicRooms() {
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

//해당 룸에 참여한 인원
function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    //발생한 이벤트를 알려줌
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });

    //join room event
    socket.on("enter_room", (roomName, done) => {
        //join room
        socket.join(roomName);
        done();
        //해당 room에 참여중인 인원에게 welcome event 전달
        socket
            .to(roomName)
            .emit("welcome", socket.nickname, countRoom(roomName));
        //모든 유저에서 room_change event 전달
        wsServer.sockets.emit("room_change", publicRooms());
    });

    //접속 해제 전 event
    socket.on("disconnecting", () => {
        //해당 유저가 참여한 room 인원들에게 접속 해제를 알림
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        );
    });

    //접속 해제 event
    socket.on("disconnect", () => {
        //모든 유저들에게 알림
        wsServer.sockets.emit("room_change", publicRooms());
    });

    //message event
    socket.on("new_message", (msg, room, done) => {
        //참여자들에게 new_message event 전달
        socket.to(room).emit("new_message", msg);
        done();
    });
});

/* websokcet */
// //http와 ws를 같이 쓸 수 있다.
// const wss = new WebSocket.Server({ httpServer });

// const sockets = [];

// //connection event, 연결됐을 때 특정 행동
// wss.on("connection", (socket) => {
//     console.log("Connected to Browser ✅");

//     //각 브라우저마다 실행되므로 접속한 브라우저를 배열에 넣는다
//     sockets.push(socket);
//     //socket안에 data를 넣어줄 수 있다.
//     socket["nickname"] = "Anon";

//     //close event, 연결이 끊겼을 때 특정 행동
//     socket.on("close", () => console.log("Disconnected from the Browser ❌"));

//     //message event, 브라우저에서 socket send 함수에 대응하는 event
//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch (message.type) {
//             case "new_message":
//                 sockets.forEach((aSocket) =>
//                     aSocket.send(`${socket.nickname}: ${message.payload}`)
//                 );
//             case "nickname":
//                 socket["nickname"] = message.payload;
//         }
//     });
// });

// httpServer.listen(3000, handleListen);
