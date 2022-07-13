import express from "express";

const app = express();

//pug사용
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
//정적파일 등록
app.use("/public", express.static(__dirname + "/public"));
// "/" url만 사용할 수 있도록 설정
app.get("/", (req, res) => res.render("home"));

app.listen(3000, () => {
    console.log("start server");
});
