"use client";

import { useState } from "react";

interface AuthFormData {
  [key: string]: string;
}

interface AuthFormProps {
  title: string;
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
  title,
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
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label
            htmlFor={field.name}
            className="text-sm font-medium"
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
            className="w-full rounded-md border px-4 py-2 outline-none focus:ring-2"
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
        className="w-full rounded-md px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Loading..." : submitButtonText}
      </button>
    </form>
  );
}
