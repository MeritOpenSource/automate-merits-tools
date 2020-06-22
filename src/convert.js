const csv = require("csv-parse");
const csvWriter = require("csv-writer");
const fs = require("fs");
const moment = require("moment");
const path = require("path");

exports.execute = (input, output, { separator, date }) => {
  const header = [];
  const records = [];

  let hasHeader = false;

  fs.createReadStream(input)
    .pipe(csv({ delimiter: separator, relax: true }))
    .on("data", data => {
      let includeRow = true;

      for (let id in data) {
        // Setup
        if (!hasHeader) {
          const title = data[id].includes("-") ? data[id].replace(/-/g, " ") : data[id];
          if (typeof title === "string" && title.trim().length > 0) {
            header.push({ id, title });
          }
        } else {

          const { title } = header.find(_ => _.id === id) || {};

          // Transform
          if (/date/i.test(title)) {
            const parsed = moment(data[id], date);

            if (parsed.isValid()) {
              data[id] = parsed.format("YYYY-MM-DD");
            } else {
              data[id] = "";
            }
          }

          // Filter
          if (/email/i.test(title)) {
            // Omit rows which do not have an email
            if (typeof data[id] !== "string" || data[id].trim().length === 0) {
              includeRow = false;
            }
          }
        }
      }

      if (!hasHeader) {
        hasHeader = true;
      } else {
        if (includeRow) {
          records.push(data);
        }
      }
    })
    .on("end", () => {
      const writer = csvWriter.createObjectCsvWriter({ path: path.resolve(output), header });
      writer.writeRecords(records)
        .then(() => console.log(`Finished writing to ${output}`))
    });
};
