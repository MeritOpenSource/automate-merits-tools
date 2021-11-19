import csv from "csv-parse";
import * as csvWriter from "csv-writer";
import faker from "faker";
import fs from "fs";
import path from "path";

const { forPercent, generateFutureDate } = require("./common");

exports.execute = (input, output, { email, operations }) => {
  const header = [];
  const records = [];
  const ops = operations.split(",").map(_ => _.trim());

  let hasHeader = false;

  fs.createReadStream(input)
    .pipe(csv())
    .on("data", data => {
      const shouldEdit = ops.includes("edit") && forPercent(50, true, false);
      let isMeritTransferred = false;

      for (let id in data) {
        if (!hasHeader) {
          const title = data[id];
          if (typeof title === "string" && title.trim().length > 0) {
            header.push({ id, title });
          }
        } else {
          const { title } = header.find(_ => _.id === id) || {};

          if (shouldEdit) {
            if (/date/i.test(title)) {
              data[id] = generateFutureDate(data[id]);
            }
          }

          if (ops.includes("transfer")) {
            if (/email/i.test(title)) {
              const isMemberless = !data[id];

              data[id] = forPercent(
                isMemberless ? 75 : 10,
                () => faker.internet.email(undefined, undefined, email),
                data[id]
              );

              if (isMemberless && data[id]) {
                isMeritTransferred = true;
              }
            }
          }

          if (ops.includes("revoke") && !isMeritTransferred) {
            if (/revoked/i.test(title)) {
              data[id] = forPercent(50, !!data[id], data[id])
            }
          }
        }
      }

      if (!hasHeader) {
        hasHeader = true;
      } else {
        records.push(data);
      }
    })
    .on("end", () => {
      const writer = csvWriter.createObjectCsvWriter({ path: path.resolve(output), header });
      writer.writeRecords(records)
        .then(() => console.log(`Finished writing to ${output}`))
    });
};
