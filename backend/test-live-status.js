const BASE_URL = "http://localhost:5000/api";

async function main() {
  console.log("Logging in to live server...");
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@defenseblu.com", password: "SuperAdmin@123" })
  });

  if (!loginRes.ok) {
    console.error("Login failed:", await loginRes.text());
    return;
  }

  const { token } = await loginRes.json();
  console.log("Logged in successfully. Token obtained.");

  // Get employee profile first
  const meRes = await fetch(`${BASE_URL}/employees/me`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const employee = await meRes.json();
  console.log("My Employee Profile:", employee);

  const statusesToTest = ["ONLINE", "LUNCH_BREAK", "OFFLINE"];

  for (const status of statusesToTest) {
    console.log(`\nTesting status update to: ${status}...`);
    const updateRes = await fetch(`${BASE_URL}/attendance/live-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status, employeeId: employee.id })
    });

    console.log(`Response Status: ${updateRes.status}`);
    const bodyText = await updateRes.text();
    console.log("Response Body:", bodyText);
  }
}

main().catch(console.error);
