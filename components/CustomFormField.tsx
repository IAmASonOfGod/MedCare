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
import React from "react";
import Image from "next/image";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import AvailableSlotsDatePicker from "./AvailableSlotsDatePicker";

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
  error?: string;
  type?: string;
  selectContentClassName?: string;
  practiceId?: string;
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
    type,
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
              type={type || "text"}
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
            value={field.value as any}
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
            value={field.value != null ? String(field.value) : ""}
            onValueChange={(value) => field.onChange(value)}
          >
            <FormControl>
              <SelectTrigger
                className="shad-select-trigger"
                disabled={props.disabled}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent
              className={props.selectContentClassName || "shad-select-content"}
            >
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
          dateFormat={dateFormat ?? "MM/dd/yyyy - h:mm aa"}
          showTimeSelect={showTimeSelect ?? true}
          wrapperClassName="date-picker"
          error={props.error}
          practiceId={props.practiceId || ""}
        />
      );
    default:
      return null;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, fieldType, name, label } = props;

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
          {fieldType !== FormFieldType.APPOINTMENT_DATE_PICKER && (
            <FormMessage className="shad-error" />
          )}
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
