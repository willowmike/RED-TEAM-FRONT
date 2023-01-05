var db = require("../../middlewares/db");
var seoultime = require("../../middlewares/seoultime");
var express = require("express");
var router = express.Router();
var tokenauth = require("./tokenauth");
var {
  encryptResponse,
  decryptRequest,
  decryptEnc,
} = require("../../middlewares/crypt");
const profile = require("../../middlewares/profile");
const multer = require("multer");
const checkCookie = require("../../middlewares/checkCookie");
const path = require("path");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, req.body.fid);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

router.get("/", function (req, res, next) {
  var cookie = decryptEnc(req.cookies.Token);
  profile(cookie).then((data) => {
    var cookieData = data.data;
    tokenauth.admauthresult(req, function (aResult) {
      if (aResult == true) {
        res.render("temp/notice/writeBoard", { u_data: cookieData.username });
      } else {
        res.render("temp/notice/alert");
      }
    });
  });
});

router.post(
  "/write",
  checkCookie,
  upload.single("imgimg"),
  function (req, res, next) {
    //파일 안넣으면 오류나서 변경함
    let filepath = "";
    let destination = "";
    console.log(req.file);
    if (req.file) {
      destination = req.file.destination;
      if (destination) {
        filepath = destination + "/" + req.file.filename;
      } else {
        filepath = req.file.filename;
      }
    } else {
      filepath = null;
      destination = null;
    }

    const { title, contents } = req.body;

    const cookie = req.cookies.Token;
    profile(cookie).then((data) => {
      var userId = data.data.username;

      db.query(
        `INSERT INTO notice
                  VALUES (NULL, '${userId}', '${title}', '${contents}', '${filepath}', '${seoultime}', '${seoultime}
                          ')`,
        function (error, results) {
          if (error) {
            throw error;
          }
          res.redirect("../viewBoard");
        }
      );
    });
  }
);

module.exports = router;
