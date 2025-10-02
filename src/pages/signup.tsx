import React, { useState } from "react";
import "../style/Signup.css";
import NavBar from "../components/NavBar";
import api from "../api/http";



const Signup: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const payload: any = {
      full_name: form.name,
      email: form.email,
      organization_name: form.organization,
    };
    if (form.phone) payload.phone_number = form.phone;

    const response = await api.post("/v1/public/request-access", payload);
    console.log("Request submitted:", response.data);
    alert("Access request submitted successfully!");
  } catch (error: any) {
    console.error("Error submitting request:", error);
    alert(error?.response?.data?.error || "Failed to submit access request. Please try again.");
  }
};



  return (
    <>
      <NavBar currentPage={""} />
      <div className="signup-container-wrapper">
        <div className="signup-container">
          <div className="signup-title">Sign Up</div>
          <form onSubmit={handleSubmit}>
            <div className="signup-form-group">
              <label className="signup-label" htmlFor="name">
                Name
              </label>
              <input
                className="signup-input"
                type="text"
                id="name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Enter your full name"
              />
            </div>

            <div className="signup-form-group">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                      fill="currentColor"
                    />
                  </svg>
              <label className="signup-label" htmlFor="email">
                Email Address
              </label>
              <input
                className="signup-input"
                type="email"
                id="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="Enter your email"
              />
            </div>

            <div className="signup-form-group">
              <label className="signup-label" htmlFor="organization">
                Organization
              </label>
              <input
                className="signup-input"
                type="text"
                id="organization"
                name="organization"
                required
                value={form.organization}
                onChange={handleChange}
                autoComplete="organization"
                placeholder="Enter your organization"
              />
            </div>

            <div className="signup-form-group">
              <label className="signup-label" htmlFor="phone">
                Phone Number{" "}
                <span
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginLeft: 6 }}
                >
                  (optional)
                </span>
              </label>
              <input
                className="signup-input"
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="Enter your phone number"
              />
            </div>

            <button className="signup-button" type="submit">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
