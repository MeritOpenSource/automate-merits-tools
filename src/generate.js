const csv = require("csv-writer");
const faker = require("faker");
const path = require("path");

const {forPercent, getIssuedAndExpiredDate} = require("./common");

const header = [
  { id: "email", title: "Email", generator: ({ memberless, firstName, lastName, email }) =>   memberless ? "" : forPercent(75, () => faker.internet.email(firstName, lastName, email))},
  { id: "firstName", title: "First Name", generator: ({ firstName }) => firstName},
  { id: "lastName", title: "Last Name", generator: ({ lastName }) => lastName},
  { id: "city", title: "City", generator: () => faker.address.city()},
  { id: "state", title: "State", generator: () => faker.address.stateAbbr()},
  { id: "zipCode", title: "Zip Code", generator: () => faker.address.zipCode()},
  { id: "licenseNumber", title: "License Number", generator: () => faker.random.uuid() },
  { id: "dateIssued", title: "Date Issued", generator: ({ dateIssued }) => dateIssued },
  { id: "expirationDate", title: "Expiration Date", generator: ({ expirationDate }) => expirationDate },
  { id: "suspended", title: "Suspended", generator: () => forPercent(20, true) },
  { id: "revoked", title: "Revoked", generator: () => false },
  { id: "revokeReason", title: "Revoke Reason", generator: () => faker.lorem.words(10) },
  { id: "phoneNumber", title: "Phone Number", generator: () => faker.phone.phoneNumber(forPercent(80, "###-###-####", "(###) ###-####")) },
  { id: "longText", title: "Long Text", generator: () => faker.lorem.words(55) }
]

exports.execute = (output, { count, email, memberless, headers }) => {
  const records = [];
  const headersEnabled = headers.toString().split(",")
  const headersToUse = header.filter(h => headersEnabled.includes(h.id))
  const writer = csv.createObjectCsvWriter({ path: path.resolve(output), header: headersToUse });

  for (let i = 0; i < count; i++) {
    const record = {}
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const { dateIssued, expirationDate } = getIssuedAndExpiredDate()
    headersToUse.forEach(h => {
      record[h.id] = h.generator({
        memberless: memberless,
        firstName: firstName,
        lastName: lastName,
        dateIssued: dateIssued,
        expirationDate: expirationDate,
        email: email
      })
    })
    records.push(record);
  }

  console.log(`Writing to ${output}`);

  writer.writeRecords(records)
    .then(() => console.log(`Finished writing to ${output}`));
};
