const csv = require("csv-writer");
const faker = require("faker");
const path = require("path");

const {forPercent, getIssuedAndExpiredDate} = require("./common");

const header = [
  { id: "email", title: "Email" },
  { id: "firstName", title: "First Name" },
  { id: "lastName", title: "Last Name" },
  { id: "city", title: "City" },
  { id: "state", title: "State" },
  { id: "zipCode", title: "Zip Code"},
  { id: "licenseNumber", title: "License Number" },
  { id: "dateIssued", title: "Date Issued" },
  { id: "expirationDate", title: "Expiration Date" },
  { id: "suspended", title: "Suspended" },
  { id: "revoked", title: "Revoked" },
  { id: "revokeReason", title: "Revoke Reason" },
  { id: "longText", title: "Long Text" }
]

exports.execute = (output, { count, email, memberless }) => {
  const records = [];
  const writer = csv.createObjectCsvWriter({ path: path.resolve(output), header });

  for (let i = 0; i < count; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const { dateIssued, expirationDate } = getIssuedAndExpiredDate();

    records.push({
      email: memberless ? "" : forPercent(75, () => faker.internet.email(firstName, lastName, email)),
      firstName,
      lastName,
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zipCode: faker.address.zipCode(),
      licenseNumber: faker.random.uuid(),
      dateIssued,
      expirationDate,
      suspended: forPercent(20, true),
      revoked: false,
      revokeReason: faker.lorem.words(10),
      longText: firstName.repeat(20),
    });
  }

  console.log(`Writing to ${output}`);

  writer.writeRecords(records)
    .then(() => console.log(`Finished writing to ${output}`));
};
