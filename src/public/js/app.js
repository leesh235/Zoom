const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
//ws연결
const socket = new WebSocket(`ws://${window.location.host}`);

//json => string
function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}

//ws연결 시
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

//backend에서 send함수 실행 시
socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

//server가 닫혔을 때
socket.addEventListener("close", () => {
    console.log("Disconnected from Server ❌");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
