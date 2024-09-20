function getDaysDifference(startDate, endDate) {
  const msInDay = 1000 * 60 * 60 * 24;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end - start;
  return Math.floor(diffInMs / msInDay);
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

function getPayDate(date) {
  const result = new Date(date);

  if (!isValidDate(result)) {
    throw new Error("Invalid date passed to getPayDate");
  }

  const dayOfWeek = result.getDay();

  if (dayOfWeek === 6) {
    result.setDate(result.getDate() - 1);
  } else if (dayOfWeek === 0) {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function subtractDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function getModel(db, modelName, schemaPath) {
  const schema = require(schemaPath).schema;
  return db.model(modelName, schema, modelName.toLowerCase() + "s");
}

function formatDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  getDaysDifference,
  isValidDate,
  getPayDate,
  addDays,
  subtractDays,
  getModel,
  formatDate,
};
