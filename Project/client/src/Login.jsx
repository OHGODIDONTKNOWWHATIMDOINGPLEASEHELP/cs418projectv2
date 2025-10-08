// Importing useState hook from React and the CSS file for styling
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// This is the main Login component
export default function Login() {

  // State to store the email input from the user
  const [enteredEmail, setEnteredEmail] = useState("");

  // State to store the password input from the user
  const [enteredPassword, setEnteredPassword] = useState("");

  // State to track if the form has been submitted
  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate(); // for redirecting

  // Function to handle input changes for both email and password
  function handleInputChange(identifier, value) {
    if (identifier === "email") {
      setEnteredEmail(value); // Update email state if input is for email
    } else {
      setEnteredPassword(value); // Update password state otherwise
    }
  }

  // Function to handle form submission when the user clicks "Sign In"
  const handleLogin = async () => {
    setSubmitted(true); // Mark that the user tried to submit the form

    // If email is not empty, show an alert with the email
    // if (enteredEmail != "") alert("Email:" + enteredEmail);

    const formBody = JSON.stringify({
      Email: enteredEmail,
      Password: enteredPassword,
    });

    // console.log(import.meta.env.VITE_API_KEY + "user/login");
    const response = await fetch(import.meta.env.VITE_API_KEY + "user/login", {
    // const response = await fetch("http://localhost:8080/user/login", {
      method: "POST", //GET , PUT     
      body: formBody,
      headers: {
        "content-type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result);
       navigate("/dashboard");
    }
  };

  // Validation: email must include '@'
  const emailNotValid = submitted && !enteredEmail.includes("@");

  // Validation: password must be at least 8 characters long
  const passwordNotValid = submitted && enteredPassword.trim().length < 8;

  return (
    <div id="login">
      <div className="controls">
        {/* Email input field */}
        <p>
          <label>Email</label>
          <input
            type="email"
            // Add 'invalid' class if the email is invalid after form submission
            className={emailNotValid ? "invalid" : undefined}
            // Update email state on change
            onChange={(event) => handleInputChange("email", event.target.value)}
          />
        </p>

        {/* Password input field */}
        <p>
          <label>Password</label>
          <input
            type="password"
            // Add 'invalid' class if the password is invalid after form submission
            className={passwordNotValid ? "invalid" : undefined}
            // Update password state on change
            onChange={(event) =>
              handleInputChange("password", event.target.value)
            }
          />
        </p>
      </div>

      {/* Buttons section */}
      <div className="actions">
        {/* Placeholder button for creating a new account */}
        <button type="button" className="button">
          Create a new account
        </button>

        {/* Button to trigger login function */}
        <button className="button" onClick={handleLogin}>
          Sign In
        </button>
      </div>
    </div>
  );
}
