"use client";

import { useState } from "react";

interface AuthFormData {
  [key: string]: string;
}

interface AuthFormProps {
  onSubmit: (data: AuthFormData) => void;
  isLoading?: boolean;
  error?: string;
  fields: Array<{
    name: string;
    label: string;
    type: "email" | "password" | "text";
    placeholder?: string;
  }>;
  submitButtonText: string;
}

export default function AuthForm({
  onSubmit,
  isLoading = false,
  error,
  fields,
  submitButtonText,
}: AuthFormProps) {
  const [formData, setFormData] = useState<AuthFormData>({});
  const [validationError, setValidationError] = useState("");

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const missingField = fields.find((field) => !formData[field.name]?.trim());
    if (missingField) {
      setValidationError(`${missingField.label} is required.`);
      return;
    }

    const email = formData.email?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError("Enter a valid email address.");
      return;
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    setValidationError("");
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-slate-700"
          >
            {field.label}
          </label>

          <input
            id={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name] ?? ""}
            required
            onChange={(event) =>
              handleChange(field.name, event.target.value)
            }
            autoComplete={field.type === "password"
              ? field.name === "confirmPassword" ? "new-password" : "current-password"
              : field.type === "email" ? "email" : field.name === "name" ? "name" : "off"}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 caret-indigo-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
           ))}

      {(validationError || error) && (
        <p role="alert" className="text-sm text-red-500">
          {validationError || error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Loading..." : submitButtonText}
      </button>
    </form>
  );
}
