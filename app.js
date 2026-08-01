"use strict";

/*
 * The GAS_URL is injected during the GitHub Actions build.
 *
 * Do not put your Gemini API key here.
 * Only the Google Apps Script Web App URL is needed.
 */

var GAS_URL =
  window.APP_CONFIG &&
  typeof window.APP_CONFIG.GAS_URL === "string"
    ? window.APP_CONFIG.GAS_URL.trim()
    : "";


/**
 * Creates a JSON response error.
 */
function createApiError(message, details) {
  var error = new Error(message);

  if (details) {
    error.details = details;
  }

  return error;
}


/**
 * Sends a request to the Google Apps Script backend.
 */
async function callGasApi(payload) {
  if (!GAS_URL) {
    throw createApiError(
      "GAS_URL is not configured. Check the GitHub Actions secret and deployment configuration."
    );
  }

  var response;

  try {
    response = await fetch(GAS_URL, {
      method: "POST",

      /*
       * text/plain avoids a browser preflight request with many
       * Google Apps Script Web App deployments.
       */
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },

      body: JSON.stringify(payload),

      /*
       * The default browser mode is cors.
       * Do not use mode: "no-cors", because that makes the response unreadable.
       */
      redirect: "follow"
    });
  } catch (networkError) {
    throw createApiError(
      "Could not connect to the Google Apps Script service.",
      networkError
    );
  }

  var responseText = await response.text();
  var responseData;

  try {
    responseData = JSON.parse(responseText);
  } catch (parseError) {
    console.error(
      "Invalid Google Apps Script response:",
      responseText
    );

    throw createApiError(
      "The Google Apps Script service returned an invalid response.",
      parseError
    );
  }

  if (!responseData || responseData.success !== true) {
    var backendError =
      responseData && responseData.error
        ? responseData.error
        : "The request failed.";

    if (responseData && responseData.httpStatus) {
      backendError +=
        " HTTP status: " +
        responseData.httpStatus +
        ".";
    }

    if (responseData && responseData.finishReason) {
      backendError +=
        " Finish reason: " +
        responseData.finishReason +
        ".";
    }

    if (responseData && responseData.blockReason) {
      backendError +=
        " Block reason: " +
        responseData.blockReason +
        ".";
    }

    throw createApiError(backendError, responseData);
  }

  return responseData;
}


/**
 * Requests a product comparison from Google Apps Script.
 */
async function requestComparison(query) {
  var cleanQuery = String(query || "").trim();

  if (!cleanQuery) {
    throw createApiError(
      "Please enter the products you want to compare."
    );
  }

  var responseData = await callGasApi({
    action: "compare",
    query: cleanQuery
  });

  var result = responseData.result;

  if (typeof result !== "string") {
    throw createApiError(
      "The comparison response did not contain text."
    );
  }

  result = result.trim();

  if (!result) {
    throw createApiError(
      "Gemini returned an empty comparison result."
    );
  }

  return result;
}


/**
 * Displays generated comparison text safely.
 *
 * textContent is intentionally used instead of innerHTML so that
 * Gemini-generated content cannot inject HTML or JavaScript.
 */
function showComparisonResult(resultElement, result) {
  if (!resultElement) {
    return;
  }

  resultElement.textContent = result;
  resultElement.hidden = false;
}


/**
 * Displays an error safely.
 */
function showComparisonError(resultElement, error) {
  if (!resultElement) {
    return;
  }

  var message =
    error && error.message
      ? error.message
      : "Something went wrong while generating the comparison.";

  resultElement.textContent = message;
  resultElement.hidden = false;
}


/**
 * Initializes the product comparison form.
 *
 * Expected HTML element IDs:
 *
 * comparisonForm
 * comparisonQuery
 * compareButton
 * comparisonResult
 */
function initializeComparisonForm() {
  var form = document.getElementById("comparisonForm");
  var queryInput = document.getElementById("comparisonQuery");
  var compareButton = document.getElementById("compareButton");
  var resultElement = document.getElementById("comparisonResult");

  if (!form || !queryInput || !resultElement) {
    console.warn(
      "Comparison form was not initialized. Check the required element IDs."
    );
    return;
  }

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    var query = queryInput.value.trim();

    if (!query) {
      showComparisonError(
        resultElement,
        createApiError(
          "Please enter a product comparison query."
        )
      );
      return;
    }

    var originalButtonText = "";

    if (compareButton) {
      originalButtonText = compareButton.textContent;
      compareButton.disabled = true;
      compareButton.textContent = "Comparing...";
    }

    resultElement.hidden = false;
    resultElement.textContent =
      "Generating your comparison...";

    try {
      var result = await requestComparison(query);

      showComparisonResult(
        resultElement,
        result
      );
    } catch (error) {
      console.error(
        "Comparison request failed:",
        error
      );

      showComparisonError(
        resultElement,
        error
      );
    } finally {
      if (compareButton) {
        compareButton.disabled = false;
        compareButton.textContent = originalButtonText;
      }
    }
  });
}


/**
 * Start the app after the page loads.
 */
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeComparisonForm
  );
} else {
  initializeComparisonForm();
}
