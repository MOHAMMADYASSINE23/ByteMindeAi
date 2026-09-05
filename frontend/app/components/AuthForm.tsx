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

export default function AuthForm({ title, onSubmit, isLoading = false, error, fields, submitButtonText }: AuthFormProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name] : value}));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(formData);
    };
      return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {title}
        </h1>
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
            onChange={(event) =>
              handleChange(field.name, event.target.value)
            }
            className="w-full rounded-md border px-4 py-2 outline-none focus:ring-2"
          />
        </div>
           ))}

      {error && (
        <p className="text-sm text-red-500">
          {error}
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
