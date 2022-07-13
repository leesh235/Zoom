import http from "http";
import WebSocket from "ws";
import express from "express";

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

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

//connection event, 연결됐을 때 특정 행동
wss.on("connection", (socket) => {
    console.log("Connected to Browser ✅");

    //각 브라우저마다 실행되므로 접속한 브라우저를 배열에 넣는다
    sockets.push(socket);
    //socket안에 data를 넣어줄 수 있다.
    socket["nickname"] = "Anon";

    //close event, 연결이 끊겼을 때 특정 행동
    socket.on("close", () => console.log("Disconnected from the Browser ❌"));

    //message event, 브라우저에서 socket send 함수에 대응하는 event
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch (message.type) {
            case "new_message":
                sockets.forEach((aSocket) =>
                    aSocket.send(`${socket.nickname}: ${message.payload}`)
                );
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
});

server.listen(3000, handleListen);
