let currentPage = 1;
const formData = {};
let currentAuthType = "basic";

// Helper functions for showing success/error messages
function showSuccess(message) {
  const testButton = document.querySelector(".test-connection");
  const errorElement = document.getElementById("connectionError");
  const nextButton = document.getElementById("nextButton");

  // Update button state
  testButton.innerHTML = `Connection Successful <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="margin-left: 8px">
    <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
  </svg>`;
  testButton.style.backgroundColor = "var(--success-color)";
  testButton.style.color = "white";
  testButton.style.borderColor = "var(--success-color)";
  testButton.classList.add("success");
  
  // Enable next button
  nextButton.disabled = false;
  
  // Hide error message if any
  errorElement.classList.remove("visible");
  
  // Store authentication state
  sessionStorage.setItem("authenticationComplete", "true");
}

function showError(message) {
  const testButton = document.querySelector(".test-connection");
  const errorElement = document.getElementById("connectionError");
  const nextButton = document.getElementById("nextButton");

  // Show error message
  errorElement.textContent = message || "Connection failed. Please check your credentials and try again.";
  errorElement.classList.add("visible");
  
  // Reset button state
  testButton.style.backgroundColor = "";
  testButton.style.color = "";
  testButton.style.borderColor = "";
  testButton.textContent = "Test Connection";
  testButton.classList.remove("success");
  
  // Disable next button
  nextButton.disabled = true;
  
  // Remove authentication state
  sessionStorage.removeItem("authenticationComplete");
}

function updateFormData() {
  const activeSection = document.querySelector(".auth-section.active");
  if (!activeSection) return;

  // Get common inputs from page 1 only
  const commonInputs = document.querySelectorAll(
    "#page1 > .form-group input, #page1 .form-group.horizontal input"
  );
  commonInputs.forEach((input) => {
    if (input.value) {
      formData[input.id] = input.value;
    }
  });

  // Get active authentication section inputs
  const activeInputs = activeSection.querySelectorAll("input");
  activeInputs.forEach((input) => {
    if (input.value) {
      formData[input.id] = input.value;
    }
  });
}

function updateSteps() {
  const steps = document.querySelectorAll(".step");
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.remove("active", "completed");
    if (stepNumber === currentPage) {
      step.classList.add("active");
    } else if (stepNumber < currentPage) {
      step.classList.add("completed");
    }
  });
}

function goToPage(pageNumber) {
  // Validate page number
  if (pageNumber < 1 || pageNumber > 3) return;

  // Prevent unauthorized navigation
  if (pageNumber > currentPage) {
    // Check if trying to go past page 1 without authentication
    if (pageNumber > 1 && !sessionStorage.getItem("authenticationComplete")) {
      return;
    }

    // Check if trying to go past page 2
    if (pageNumber > 2) {
      const connectionName = document
        .getElementById("connectionName")
        .value.trim();
      if (!connectionName) {
        return;
      }
    }
  }

  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // Hide all navigation buttons
  document.querySelectorAll(".nav-buttons").forEach((nav) => {
    nav.style.display = "none";
  });

  // Show selected page
  document.getElementById(`page${pageNumber}`).classList.add("active");

  // Show corresponding navigation buttons
  document.getElementById(`page${pageNumber}-nav`).style.display = "flex";

  // If navigating to page 3, populate metadata dropdowns
  if (pageNumber === 3) {
    populateMetadataDropdowns();
  }

  // Update current page and steps
  currentPage = pageNumber;
  updateSteps();
}

async function nextPage() {
  // If on page 1, ensure authentication is complete
  if (currentPage === 1) {
    if (!sessionStorage.getItem("authenticationComplete")) {
      const success = await testConnection();
      if (!success) {
        return;
      }
    }
    goToPage(2);
    return;
  }

  // For page 2
  if (currentPage === 2) {
    const connectionNameInput = document.getElementById("connectionName");
    const connectionName = connectionNameInput.value.trim();

    if (!connectionName) {
      connectionNameInput.style.border = "2px solid #DC2626";
      connectionNameInput.style.animation = "shake 0.5s";
      connectionNameInput.addEventListener("animationend", () => {
        connectionNameInput.style.animation = "";
      });
      connectionNameInput.addEventListener(
        "input",
        () => {
          connectionNameInput.style.border = "1px solid var(--border-color)";
        },
        { once: true }
      );
      return;
    }

    goToPage(3);
    return;
  }

  // For page 3 (if needed in the future)
  const nextPageNum = currentPage + 1;
  if (nextPageNum <= 3) {
    goToPage(nextPageNum);
  }
}

function previousPage() {
  const prevPageNum = currentPage - 1;
  if (prevPageNum >= 1) {
    goToPage(prevPageNum);
  }
}

function getConnectionParams() {
  const host = document.getElementById('host').value;
  const port = document.getElementById('port').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const catalog = document.getElementById('catalog').value;
  const schema = document.getElementById('schema').value;

  return {
    host,
    port,
    username,
    password,
    catalog,
    schema,
    protocol: 'https',
    verify: true,
    source: 'atlan',
    isolation_level: 'AUTOCOMMIT'
  };
}

function validateConnectionParams(params) {
  const required = ['host', 'port', 'username', 'password', 'catalog', 'schema'];
  const missing = required.filter(param => !params[param]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }

  // Validate port number
  if (isNaN(params.port) || params.port < 1 || params.port > 65535) {
    throw new Error('Port must be a number between 1 and 65535');
  }
}

function buildConnectionString(params) {
  const baseUrl = `trino://${params.username}:${params.password}@${params.host}:${params.port}`;
  const path = `/${params.catalog}/${params.schema}`;
  const queryParams = new URLSearchParams({
    protocol: params.protocol,
    verify: params.verify,
    source: params.source,
    isolation_level: params.isolation_level
  });
  
  return `${baseUrl}${path}?${queryParams}`;
}

async function testConnection() {
  const testButton = document.querySelector(".test-connection");
  const errorElement = document.getElementById("connectionError");
  const nextButton = document.getElementById("nextButton");

  try {
    // Disable test button and show loading state
    testButton.disabled = true;
    testButton.textContent = "Testing...";
    errorElement.classList.remove("visible");

    const success = await performConnectionTest();

    if (success) {
      // Success case
      testButton.innerHTML = `Connection Successful <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="margin-left: 8px">
                <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
            </svg>`;
      testButton.style.backgroundColor = "var(--success-color)";
      testButton.style.color = "white";
      testButton.style.borderColor = "var(--success-color)";
      testButton.classList.add("success");
      nextButton.disabled = false;
      errorElement.classList.remove("visible");

      // Store authentication state
      sessionStorage.setItem("authenticationComplete", "true");
      return true;
    } else {
      throw new Error("Connection failed");
    }
  } catch (error) {
    // Show error message
    errorElement.textContent =
      error.message ||
      "Failed to connect. Please check your credentials and try again.";
    errorElement.classList.add("visible");
    testButton.style.backgroundColor = "";
    testButton.style.color = "";
    testButton.style.borderColor = "";
    testButton.textContent = "Test Connection";
    testButton.classList.remove("success");
    nextButton.disabled = true;
    sessionStorage.removeItem("authenticationComplete");
    return false;
  } finally {
    testButton.disabled = false;
  }
}

async function performConnectionTest() {
  const activeSection = document.querySelector(".auth-section.active");
  if (!activeSection) return false;

  // Get common values
  const host = document.getElementById("host").value;
  const port = document.getElementById("port").value;
  const catalog = document.getElementById("catalog").value;
  const schema = document.getElementById("schema").value;
  const username = activeSection.querySelector("#username").value;
  const password = document.getElementById("password").value;

  let payload = {
    host,
    port,
    extra: {
      catalog,
      schema,
      protocol: "http",
      verify: "true",
      source: "atlan",
      isolation_level: "AUTOCOMMIT"
    },
    authType: "basic",
    type: "all",
    username,
    password
  };

  const response = await fetch(`/workflows/v1/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Connection failed");
  }

  return data.success;
}

// Initialize button states
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".button-group .btn");
  buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const group = e.target.closest(".button-group");
      group.querySelectorAll(".btn").forEach((btn) => {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary");
      });
      e.target.classList.remove("btn-secondary");
      e.target.classList.add("btn-primary");
    });
  });

  // Update step click handlers
  document.querySelectorAll(".step").forEach((step) => {
    step.addEventListener("click", () => {
      const targetPage = parseInt(step.dataset.step);
      if (targetPage <= currentPage) {
        // Only allow clicking on current or previous steps
        goToPage(targetPage);
      }
    });
  });

  // Clear authentication state on page load
  sessionStorage.removeItem("authenticationComplete");
});

// Add these new functions

let metadataOptions = {
  include: new Map(),
  exclude: new Map(),
};

function processMetadataResponse(data) {
  // Group by TABLE_CATALOG instead of database
  const databases = new Map();

  data.forEach((item) => {
    if (!databases.has(item.TABLE_CATALOG)) {
      databases.set(item.TABLE_CATALOG, new Set());
    }
    databases.get(item.TABLE_CATALOG).add(item.TABLE_SCHEMA);
  });

  return databases;
}

async function fetchMetadata() {
  try {
    const activeSection = document.querySelector(".auth-section.active");
    if (!activeSection) return false;

    // Get common values
    const host = document.getElementById("host").value;
    const port = document.getElementById("port").value;
    const catalog = document.getElementById("catalog").value;
    const schema = document.getElementById("schema").value;
    const username = activeSection.querySelector("#username").value;
    const password = document.getElementById("password").value;

    let payload = {
      host,
      port,
      database: catalog,
      extra: {
        catalog,
        schema,
        protocol: "http",
        verify: "true",
        source: "atlan",
        isolation_level: "AUTOCOMMIT"
      },
      authType: "basic",
      type: "all",
      username,
      password
    };

    const response = await fetch(`/workflows/v1/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch metadata");
    }

    const data = await response.json();
    return processMetadataResponse(data.data);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return new Map();
  }
}

function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  const content = dropdown.querySelector(".dropdown-content");

  // Close all other dropdowns first
  document.querySelectorAll(".dropdown-content").forEach((otherContent) => {
    if (otherContent !== content) {
      otherContent.classList.remove("show");
    }
  });

  // Toggle the clicked dropdown
  content.classList.toggle("show");

  // Prevent the click from bubbling up to the document
  event.stopPropagation();
}

function updateDropdownHeader(type, tableCatalog, totalSchemas, selectedCount) {
  const dropdown = document.getElementById(`${type}Metadata`);
  const header = dropdown.querySelector(".dropdown-header span");

  // Get all selected databases and their schemas
  const selectedDatabases = [];
  metadataOptions[type].forEach((schemas, database) => {
    if (schemas.size > 0) {
      selectedDatabases.push(`${database} (${schemas.size} schemas)`);
    }
  });

  if (selectedDatabases.length === 0) {
    header.textContent = "Select databases and schemas";
  } else if (selectedDatabases.length === 1) {
    header.textContent = selectedDatabases[0];
  } else {
    // Show first database and count of others
    header.textContent = `${selectedDatabases[0]} +${
      selectedDatabases.length - 1
    } more`;
  }

  // Add tooltip for full list when multiple databases are selected
  if (selectedDatabases.length > 1) {
    header.title = selectedDatabases.join("\n");
  } else {
    header.title = "";
  }
}

async function populateMetadataDropdowns() {
  // Show loading state for both dropdowns
  ["include", "exclude"].forEach((type) => {
    const dropdown = document.getElementById(`${type}Metadata`);
    const header = dropdown.querySelector(".dropdown-header span");
    const content = dropdown.querySelector(".dropdown-content");
    header.textContent = "Loading...";
    content.innerHTML = ""; // Clear existing content
  });

  // Clear existing selections
  metadataOptions.include.clear();
  metadataOptions.exclude.clear();

  // Make single API call
  const databases = await fetchMetadata();

  // Populate both dropdowns with the same data
  ["include", "exclude"].forEach((type) => {
    populateDropdown(type, databases);
  });
}

// New helper function to populate a single dropdown
// New helper function to populate a single dropdown
function populateDropdown(type, databases) {
  const dropdown = document.getElementById(`${type}Metadata`);
  const content = dropdown.querySelector(".dropdown-content");
  const header = dropdown.querySelector(".dropdown-header span");

  // Reset content
  content.innerHTML = "";

  // Update header text based on whether we got data
  if (databases.size === 0) {
    header.textContent = "No databases available";
    return;
  }

  // Reset to default text
  header.textContent = "Select databases and schemas";

  databases.forEach((schemas, tableCatalog) => {
    // Create database container
    const dbContainer = document.createElement("div");
    dbContainer.className = "database-container";

    // Create database header
    const dbDiv = document.createElement("div");
    dbDiv.className = "database-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `${type}-${tableCatalog}`;

    const label = document.createElement("label");
    label.textContent = tableCatalog;
    label.htmlFor = `${type}-${tableCatalog}`;

    const schemaCount = document.createElement("span");
    schemaCount.className = "selected-count";
    schemaCount.textContent = `0/${schemas.size}`;

    dbDiv.appendChild(checkbox);
    dbDiv.appendChild(label);
    dbDiv.appendChild(schemaCount);

    // Create schema list
    const schemaList = document.createElement("div");
    schemaList.className = "schema-list";

    schemas.forEach((schemaName) => {
      const schemaDiv = document.createElement("div");
      schemaDiv.className = "schema-item";

      const schemaCheckbox = document.createElement("input");
      schemaCheckbox.type = "checkbox";
      schemaCheckbox.id = `${type}-${tableCatalog}-${schemaName}`;

      const schemaLabel = document.createElement("label");
      schemaLabel.textContent = schemaName;
      schemaLabel.htmlFor = `${type}-${tableCatalog}-${schemaName}`;

      schemaDiv.appendChild(schemaCheckbox);
      schemaDiv.appendChild(schemaLabel);
      schemaList.appendChild(schemaDiv);

      schemaCheckbox.addEventListener("change", (e) => {
        handleSchemaSelection(type, tableCatalog, schemaName, e.target.checked);
        updateSelectionCount(type, tableCatalog, schemas.size);

        // Uncheck main checkbox if any sub-option is unchecked
        if (!e.target.checked) {
          checkbox.checked = false;
        } else {
          // Check if all sub-options are selected
          const allChecked = Array.from(
            schemaList.querySelectorAll('input[type="checkbox"]')
          ).every((cb) => cb.checked);
          checkbox.checked = allChecked;
        }
      });
    });

    // Add all elements to the container
    dbContainer.appendChild(dbDiv);
    dbContainer.appendChild(schemaList);
    content.appendChild(dbContainer);

    // Add database checkbox event listener
    checkbox.addEventListener("change", (e) => {
      handleDatabaseSelection(
        type,
        tableCatalog,
        Array.from(schemas),
        e.target.checked
      );
      schemaList
        .querySelectorAll('input[type="checkbox"]')
        .forEach((cb) => (cb.checked = e.target.checked));
      updateSelectionCount(type, tableCatalog, schemas.size);
    });

    // Add click event to toggle schema list
    dbDiv.addEventListener("click", (e) => {
      if (e.target.type !== "checkbox") {
        schemaList.classList.toggle("show");
      }
    });
  });
}
function handleDatabaseSelection(type, tableCatalog, schemas, isSelected) {
  if (!metadataOptions[type].has(tableCatalog)) {
    metadataOptions[type].set(tableCatalog, new Set());
  }

  if (isSelected) {
    schemas.forEach((schema) => {
      metadataOptions[type].get(tableCatalog).add(schema);
    });
  } else {
    metadataOptions[type].get(tableCatalog).clear();
  }

  // Update the header with the new selection
  updateDropdownHeader(type);
}

function handleSchemaSelection(type, tableCatalog, tableSchema, isSelected) {
  if (!metadataOptions[type].has(tableCatalog)) {
    metadataOptions[type].set(tableCatalog, new Set());
  }

  if (isSelected) {
    metadataOptions[type].get(tableCatalog).add(tableSchema);
  } else {
    metadataOptions[type].get(tableCatalog).delete(tableSchema);
  }

  // Update the header with the new selection
  updateDropdownHeader(type);
}

function updateSelectionCount(type, tableCatalog, totalSchemas) {
  const selectedCount = metadataOptions[type].get(tableCatalog)?.size || 0;

  // Find the count span using more compatible selectors
  const dbContainer = document.querySelector(`#${type}Metadata`);
  const dbItems = dbContainer.querySelectorAll(".database-item");
  let countSpan;

  // Find the matching database item
  dbItems.forEach((item) => {
    const label = item.querySelector("label");
    if (label && label.textContent === tableCatalog) {
      countSpan = item.querySelector(".selected-count");
    }
  });

  if (countSpan) {
    countSpan.textContent = `${selectedCount}/${totalSchemas}`;
  }

  // Update header
  let totalSelected = 0;
  metadataOptions[type].forEach((schemas) => {
    totalSelected += schemas.size;
  });
  updateDropdownHeader(type, null, null, totalSelected);
}

// Add these new functions for preflight checks
function formatFilters(metadataOptions) {
  const formatFilter = (selections) => {
    const filter = {};
    selections.forEach((schemas, database) => {
      if (schemas.size > 0) {
        // Add ^ to start and $ to end of database name
        const dbPattern = `^${database}$`;

        // Find the database container
        let totalSchemas = 0;
        document
          .querySelectorAll(
            `#includeMetadata .database-container, #excludeMetadata .database-container`
          )
          .forEach((container) => {
            const label = container.querySelector("label");
            if (label && label.textContent === database) {
              totalSchemas = container
                .querySelector(".schema-list")
                .querySelectorAll(".schema-item").length;
            }
          });

        // Check if all schemas for this database are selected
        const allSchemasSelected = schemas.size === totalSchemas;

        if (allSchemasSelected) {
          // If all schemas are selected, use "*" instead of individual schema patterns
          filter[dbPattern] = "*";
        } else {
          // Otherwise, add ^ to start and $ to end of each schema name
          filter[dbPattern] = Array.from(schemas).map(
            (schema) => `^${schema}$`
          );
        }
      }
    });
    return JSON.stringify(filter);
  };

  return {
    "include-filter": formatFilter(metadataOptions.include),
    "exclude-filter": formatFilter(metadataOptions.exclude),
  };
}

async function runPreflightChecks() {
  const checkButton = document.getElementById("runPreflightChecks");
  checkButton.disabled = true;
  checkButton.textContent = "Checking...";

  let resultsContainer = document.querySelector(".preflight-content");
  if (!resultsContainer) {
    resultsContainer = document.createElement("div");
    resultsContainer.className = "preflight-content";
    const preflightSection = document.querySelector(".preflight-section");
    preflightSection.appendChild(resultsContainer);
  }

  resultsContainer.innerHTML = "";

  try {
    const activeSection = document.querySelector(".auth-section.active");
    if (!activeSection) return false;

    const host = document.getElementById("host").value;
    const port = document.getElementById("port").value;
    const catalog = document.getElementById("catalog").value;
    const schema = document.getElementById("schema").value;
    const username = activeSection.querySelector("#username").value;
    const password = document.getElementById("password").value;

    const payload = {
      credentials: {
        host,
        port,
        extra: {
          catalog,
          schema,
          protocol: "http",
          verify: "true",
          source: "atlan",
          isolation_level: "AUTOCOMMIT"
        },
        authType: "basic",
        type: "all",
        username,
        password
      },
      metadata: {
        "include-filter": "{}",
        "exclude-filter": "{}",
        "temp-table-regex": document.getElementById("temp-table-regex").value || ""
      }
    };

    const response = await fetch(`/workflows/v1/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const responseJson = await response.json();
    Object.entries(responseJson.data).forEach(([checkType, result]) => {
      const resultDiv = document.createElement("div");
      resultDiv.className = "check-result";

      const statusElement = document.createElement("div");
      statusElement.className = "check-status";

      if (result.success) {
        statusElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
          </svg>
          <span>${result.successMessage}</span>
        `;
        statusElement.classList.add("success");
      } else {
        statusElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
          </svg>
          <span>${result.failureMessage || "Check failed"}</span>
        `;
        statusElement.classList.add("error");
      }

      resultDiv.appendChild(statusElement);
      resultsContainer.appendChild(resultDiv);
    });
  } catch (error) {
    console.error("Preflight check failed:", error);
    const errorDiv = document.createElement("div");
    errorDiv.className = "check-status error";
    errorDiv.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
      </svg>
      <span>Failed to perform check</span>
    `;
    resultsContainer.appendChild(errorDiv);
  } finally {
    checkButton.disabled = false;
    checkButton.textContent = "Check";
  }
}

// Update the event listener setup
function setupPreflightCheck() {
  const checkButton = document.getElementById("runPreflightChecks");
  if (checkButton) {
    checkButton.addEventListener("click", async () => {
      await runPreflightChecks();
    });
  }
}

// Update your DOMContentLoaded listener
document.addEventListener("DOMContentLoaded", () => {
  setupPreflightCheck();
});

async function handleRunWorkflow() {
  const runButton = document.querySelector("#runWorkflowButton");
  if (!runButton) return;
  const modal = document.getElementById("successModal");

  runButton.addEventListener("click", async () => {
    try {
      const activeSection = document.querySelector(".auth-section.active");
      if (!activeSection) return false;

      const host = document.getElementById("host").value;
      const port = document.getElementById("port").value;
      const catalog = document.getElementById("catalog").value;
      const schema = document.getElementById("schema").value;
      const username = activeSection.querySelector("#username").value;
      const password = document.getElementById("password").value;
      const connectionName = document.getElementById("connectionName").value;

      runButton.disabled = true;
      runButton.textContent = "Starting...";

      const tenantId = window.env.TENANT_ID || "default";
      const appName = window.env.APP_NAME || "trino";
      const currentEpoch = Math.floor(Date.now() / 1000);

      const payload = {
        credentials: {
          host,
          port,
          extra: {
            catalog,
            schema,
            protocol: "http",
            verify: "true",
            source: "atlan",
            isolation_level: "AUTOCOMMIT"
          },
          authType: "basic",
          type: "all",
          username,
          password
        },
        connection: {
          connection_name: connectionName,
          connection_qualified_name: `${tenantId}/${appName}/${currentEpoch}`
        },
        metadata: {
          "include-filter": "{}",
          "exclude-filter": "{}",
          "temp-table-regex": document.getElementById("temp-table-regex").value || ""
        }
      };

      const response = await fetch(`/workflows/v1/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to start workflow");
      }

      const data = await response.json();

      runButton.textContent = "Started Successfully";
      runButton.classList.add("success");

      modal.classList.add("show");
    } catch (error) {
      console.error("Failed to start workflow:", error);
      runButton.textContent = "Failed to Start";
      runButton.classList.add("error");

      const errorMessage = document.querySelector(".error-message");
      if (errorMessage) {
        errorMessage.textContent = "Failed to start workflow. Please try again.";
        errorMessage.classList.add("visible");
      }
    } finally {
      setTimeout(() => {
        runButton.disabled = false;
        runButton.textContent = "Run";
        runButton.classList.remove("success", "error");
        modal.classList.remove("show");
      }, 3000);
    }
  });
}

// Add to your DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  handleRunWorkflow();
});

// Add this new function
function setupDropdownClickOutside() {
  document.addEventListener("click", (event) => {
    const dropdowns = document.querySelectorAll(".metadata-dropdown");
    dropdowns.forEach((dropdown) => {
      const content = dropdown.querySelector(".dropdown-content");
      // Check if click is outside the dropdown
      if (!dropdown.contains(event.target)) {
        content.classList.remove("show");
      }
    });
  });
}

// Add this to your DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  setupDropdownClickOutside();
});

// Add this new function to handle authentication type switching
function setupAuthenticationTabs() {
  const authButtons = document.querySelectorAll(
    ".button-group [data-auth-type]"
  );
  const authSections = document.querySelectorAll(".auth-section");

  function switchAuthType(type) {
    // Update buttons
    authButtons.forEach((button) => {
      if (button.dataset.authType === type) {
        button.classList.remove("btn-secondary");
        button.classList.add("btn-primary");
      } else {
        button.classList.remove("btn-primary");
        button.classList.add("btn-secondary");
      }
    });

    // Update sections
    authSections.forEach((section) => {
      if (section.id === `${type}-auth`) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

    // Update current auth type
    currentAuthType = type;

    // Reset test connection button
    const testButton = document.querySelector(".test-connection");
    testButton.style.backgroundColor = "";
    testButton.style.color = "";
    testButton.style.borderColor = "";
    testButton.textContent = "Test Connection";
    testButton.classList.remove("success");

    // Clear any existing error messages
    const errorElement = document.getElementById("connectionError");
    if (errorElement) {
      errorElement.classList.remove("visible");
    }

    // Remove authentication state
    sessionStorage.removeItem("authenticationComplete");
  }

  // Add click handlers to auth type buttons
  authButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!button.disabled) {
        switchAuthType(button.dataset.authType);
      }
    });
  });
}

// Update the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  setupAuthenticationTabs();
});
