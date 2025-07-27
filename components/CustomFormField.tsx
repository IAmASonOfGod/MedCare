"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { FormFieldType } from "./forms/PatientForm";
import React, { createContext, useContext, useState } from "react";
import Image from "next/image";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import AvailableSlotsDatePicker from "./AvailableSlotsDatePicker";
import { usePractice } from "../components/PracticeContext";
import { Query } from "node-appwrite"; // or "appwrite" if using the browser SDK

type E164Number = string & { __tag: "E164Number" };

interface CustomProps {
  control: Control<any>;
  fieldType: FormFieldType;
  name: string;
  label?: string;
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  doctorName?: string; // Add doctorName prop for appointment validation
  error?: string; // Add error prop for validation messages
  type?: string; // Add type prop for input type (e.g., number, text)
}

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
  const {
    fieldType,
    iconAlt,
    iconSrc,
    placeholder,
    showTimeSelect,
    dateFormat,
    renderSkeleton,
    type, // Add type here
  } = props;

  switch (fieldType) {
    case FormFieldType.INPUT:
      return (
        <div
          className={`flex rounded-md border border-dark-500 bg-dark-400 ${
            props.disabled
              ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
              : ""
          }`}
        >
          {iconSrc && (
            <Image
              src={iconSrc}
              height={24}
              width={24}
              alt={iconAlt || "icon"}
              className="ml-2 input-icon"
            />
          )}
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              type={type || "text"} // Pass type prop to Input
              className={`shad-input border-0 ${
                props.disabled
                  ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                  : ""
              }`}
              disabled={props.disabled}
            />
          </FormControl>
        </div>
      );
    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={placeholder}
            {...field}
            className="shad-textArea"
            disabled={props.disabled}
          />
        </FormControl>
      );
    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="ZA"
            placholder={placeholder}
            international
            withCountryCallingCode
            value={field.value as E164Number | undefined}
            onChange={field.onChange}
            className="input-phone"
          />
        </FormControl>
      );
    case FormFieldType.DATE_PICKER:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          <Image
            src="/assets/icons/calendar.svg"
            height={24}
            width={24}
            alt="calendar"
            className="ml-2 input-icon"
          />
          <FormControl>
            <DatePicker
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              dateFormat={dateFormat ?? "MM/dd/yyyy"}
              showTimeSelect={showTimeSelect ?? false}
              timeInputLabel="Time"
              wrapperClassName="date-picker"
            />
          </FormControl>
        </div>
      );
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select
            onValueChange={(value) => {
              if (props.name === "consultationInterval") {
                field.onChange(Number(value));
              } else {
                field.onChange(value);
              }
            }}
            defaultValue={field.value ? String(field.value) : undefined}
          >
            <FormControl>
              <SelectTrigger className="shad-select-trigger">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="shad-select-content">
              {props.children}
            </SelectContent>
          </Select>
        </FormControl>
      );
    case FormFieldType.SKELETON:
      return renderSkeleton ? renderSkeleton(field) : null;
    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <label htmlFor={props.name} className="checkbox-label">
              {props.label}
            </label>
          </div>
        </FormControl>
      );
    case FormFieldType.APPOINTMENT_DATE_PICKER:
      return (
        <AvailableSlotsDatePicker
          selected={field.value}
          onChange={(date) => field.onChange(date)}
          doctorName={props.doctorName || ""}
          dateFormat={dateFormat ?? "MM/dd/yyyy - h:mm aa"}
          showTimeSelect={showTimeSelect ?? true}
          wrapperClassName="date-picker"
          error={props.error}
        />
      );
    default:
      break;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, fieldType, name, label } = props;
  const { practiceName } = usePractice();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel>{label}</FormLabel>
          )}

          <RenderField field={field} props={props} />
          {/* Don't show FormMessage for appointment date picker since it handles its own error display */}
          {fieldType !== FormFieldType.APPOINTMENT_DATE_PICKER && (
            <FormMessage className="shad-error" />
          )}
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
