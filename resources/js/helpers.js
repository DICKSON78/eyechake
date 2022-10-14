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
 * Strips all non-digit characters from `text` and returns a string of digits.
 * @param text {String}
 * @returns {String}
 */
export const validateInteger = (text) => {
  text = text || "";
  return Array.prototype.slice
    .call(text)
    .filter((c) => /\d+/.test(c))
    .join("");
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
    optionalInteger: (value) => {
      const pattern = /^-?\d+$/;
      return !value ? true : (pattern.test(value) || "Invalid integer.");
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
 * Get a validation-like error object.
 * @param message
 * @returns {{response: {status: number, data: {message: *}}}}
 */
export const getValidationError = (message) => {
  return { response: { status: 422, data: { message } } };
};

/**
 * Formats an error body into a user-friendly error message.
 * @param errorBody
 * @returns {string}
 */
export const formatError = (errorBody) => {
  let message = "Something went wrong.";

  if (errorBody.response) {
    const statusCode = parseInt(errorBody.response.status);
    switch (statusCode) {
      case 401: {
        message = "You were logged out.";
      }
        break;
      case 403: {
        let data = errorBody.response.data;
        if (data.message) {
          message = data.message;
        }
      }
        break;
      case 404:
        message = "The requested resource was not found.";
        break;
      case 422: {
        // validation errors
        let data = errorBody.response.data;
        if (data.message) {
          message = data.message;
        }

        if (data.data) {
          let errors = [];
          Object.keys(data.data).forEach((e, i) => errors.push(data.data[e][0]));
          message = errors.join("\n");
        }
      }
        break;
    }
  } else if (errorBody.request) {
    message = "Network connectivity error.";
  }

  return message;
};
