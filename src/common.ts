import faker from "faker";
import moment from "moment";


function forPercent(percentage, value, alternate = null) {
  if (faker.random.number({ min: 1, max: 100 }) < percentage) {
    return !!value && !!value.call ? value() : value;
  }

  return !!alternate && !!alternate.call ? alternate() : alternate;
}

function generateFutureDate(referenceDate = null) {
  faker.date.future(1, referenceDate);
}

function getIssuedAndExpiredDate(percentExpired = 20) {
  const expirationDate = forPercent(
    percentExpired,
    faker.date.past,
    generateFutureDate
  );
  const dateIssued = faker.date.past(2, expirationDate);

  return {
    dateIssued: moment(expirationDate).format("YYYY-MM-DD"),
    expirationDate: moment(dateIssued).format("YYYY-MM-DD"),
  }
}

module.exports = { forPercent, generateFutureDate, getIssuedAndExpiredDate };
