const express = require("express");
var cors = require("cors");
var app = express();

app.use(cors());
const port = 3000;

const collect = require("collect.js");

// express.static('/', [])

// app.use(express.static('public'))

const OSSEC_ARCHIVES_PATH = "./logs/archives";
const OSSEC_ARCHIVE_FILE_BASE_NAME = "ossec-archive-";

const glob = require("glob");

app.get("/archives/list", (request, response) => {
  const getFiles = function (src, callback) {
    glob(src + "/**/ossec*(*.log||*.log.sum||*.json.gz||*.json)", callback);
  };

  getFiles(OSSEC_ARCHIVES_PATH, function (error, result) {
    if (error) {
      console.log("Error", error);
    } else {
      // console.log(result);
      let pathToRemove = OSSEC_ARCHIVES_PATH + "/";
      result = collect(result)
        .map((item) => {
          item = item.substr(pathToRemove.length);
          item = item.split("/");

          let year = item[0];
          let month = item[1];
          let file = item[2];

          console.log(item[0], item[1], item[2]);
          let fileDayWithExt = file.split(OSSEC_ARCHIVE_FILE_BASE_NAME)[1];
          let splittedDayExt = fileDayWithExt.split(".");

          let fileDate = splittedDayExt[0];
          let fileType1 = splittedDayExt[1];

          let fileType2 = undefined;

          if (typeof splittedDayExt[2] !== "undefined") {
            fileType2 = splittedDayExt[2];
          }

          let fileType = fileType1;

          if (typeof fileType2 !== "undefined") {
            fileType = fileType + "." + fileType2;
          }

          item = {
            year: year,
            month: month,
            file: file,
            fileDate: fileDate,
            fileType: fileType,
          };
          return item;
        })
        .toArray();

      response.json({ files: result });
    }
  });
});

app.get("/archives/:year/:month/:day/:type", (request, response) => {
  const file = `${OSSEC_ARCHIVES_PATH}/${request.params.year}/${request.params.month}/ossec-archive-${request.params.day}.${request.params.type}`;

  response.download(file); // Set disposition and send it.
});

//

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
