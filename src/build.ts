import fs from "fs";
import sass from "sass";

fs.mkdirSync("./public/css/", { recursive: true });

const highlight = sass.compile("./src/sass/highlight.scss");
fs.writeFileSync("./public/css/highlight.css", highlight.css);

fs.copyFileSync(
  "./node_modules/@exampledev/new.css/new.css",
  "./public/css/new.css"
);

const mknmesg = sass.compile("./src/sass/mknmesg.scss");
fs.writeFileSync("./public/css/mknmesg.css", mknmesg.css);
