/**
 * Helper functions.
 */

import moment from "moment";

/**
 * Formats a number into comma-separated sections.
 * @param number {Number} Number to be formatted
 * @returns {String}
 */
export const numberFormat = (number) => {
  let parts = number.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

/**
 * Rounds a `number` to `decimalPlaces`.
 * @param number {Number}
 * @param decimalPlaces {int}
 * @returns {Number}
 */
export const round = (number, decimalPlaces = 0) => {
  number = Math.round(number + "e" + decimalPlaces);
  return Number(number + "e" + -decimalPlaces);
};

/**
 * Capitalizes each first letter of each word in a `text`.
 * @param text {String}
 * @returns {String}
 */
export const capitalize = (text) => {
  return text
    .split(" ")
    .map((e) => e.charAt(0).toUpperCase() + e.substr(1).toLowerCase())
    .join(" ");
};

/**
 * Formats a date object or string to the format of year-month-date.
 * @param date
 * @returns {string}
 */
export const formatDateForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY-MM-DD");
};

/**
 * Formats a date object or string to the format of year-month-date hours:minutes.
 * @param date
 * @returns {string}
 */
export const formatDateTimeForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY-MM-DD HH:mm");
};

/**
 * Formats a date object or string to the format of hours:minutes.
 * @param date
 * @returns {string}
 */
export const formatTimeForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("HH:mm");
};

/**
 * Calls a `fn` after a specified `delay` time.
 * @param fn {Function}
 * @param delay {int}
 */
export const debounce = (fn, delay) => {
  if (window.debounceTimeoutID) {
    window.clearTimeout(window.debounceTimeoutID);
  }

  window.debounceTimeoutID = window.setTimeout(fn, delay);
};

/**
 * Returns an empty object if the argument is null.
 * @param object
 * @returns {*}
 */
export const getNonNull = (object) => (object ? object : {});

/**
 * Get common validation rules.
 * @returns {Object}
 */
export const getValidationRules = () => {
  return {
    required: (value) => !!value || "This field is required.",
    integer: (value) => {
      const pattern = /^-?\d+$/;
      return pattern.test(value) || "Invalid integer.";
    },
    number: (value) => {
      const pattern = /^-?\d*\.?\d+$/;
      return pattern.test(value) || "Invalid number.";
    },
    phone: (value) => {
      const pattern = /^0\d{9}$/;
      return pattern.test(value) || "Invalid phone number.";
    }
  };
};

/**
 * Formats an error body into a user-friendly error message.
 * @param errorBody
 * @returns {string}
 */
export const formatError = (errorBody) => {
  let errorMessage = "";
  let statusCode = errorBody.response
    ? parseInt(errorBody.response.status)
    : 500;
  switch (statusCode) {
    case 401: // auth errors
    case 403: {
      let data = errorBody.response.data;
      if (data.message) {
        errorMessage = data.message;
      }
    }
      break;
    case 404:
      errorMessage = "The requested resource was not found.";
      break;
    case 422: {
      // validation errors
      let data = errorBody.response.data;
      if (data.message) {
        errorMessage = data.message;
      }

      if (data.data) {
        let errors = [];
        Object.keys(data.data).forEach((e, i) => errors.push(data.data[e][0]));
        errorMessage = errors.join("\n");
      }
    }
      break;
    default:
      errorMessage = "Something went wrong.";
      break;
  }

  return errorMessage;
};
