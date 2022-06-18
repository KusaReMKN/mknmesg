import express from "express";
import ejs from "ejs";
import * as mknmesg from "./mknmesg";

const portNum = 26967;

const app = express();
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejs.renderFile);

app.get("/", mknmesg.listThread);
app.post("/", mknmesg.createThread);
app.get("/:thread", mknmesg.showThread);
app.post("/:thread", mknmesg.writeThread);

mknmesg.initDatabase();
app.listen(portNum, () => console.log(`Listening on ${portNum}`));
