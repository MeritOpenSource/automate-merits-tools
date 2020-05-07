const csv = require("csv-parser");
const csvWriter = require("csv-writer");
const fs = require("fs");
const path = require("path");

exports.execute = (input, output, { separator }) => {
  const header = [];
  const records = [];
  let writer;

  fs.createReadStream(input)
    .pipe(csv({ separator }))
    .on("data", data => {
      if (!writer && header.length === 0) {
        for (let id in data) {
          const title = id.includes("-") ? id.replace(/-/g, " ") : id;
          header.push({ id, title });
        }
        writer = csvWriter.createObjectCsvWriter({ path: path.resolve(output), header });
      }

      records.push(data);
    })
    .on("end", () => {
      writer.writeRecords(records)
        .then(() => console.log(`Finished writing to ${output}`))
    });
};
