import { ChangeEventHandler } from "react";
import styles from "./component.module.css";

type FormInputPropsType =
  | {
      type: string;
      placeholder: string;
      name: string;
      title: string;
      id: string;
      value: string;
      required?: boolean;
    } & (
      | {
          isDisabled: boolean;
        }
      | {
          onChange: ChangeEventHandler<HTMLInputElement>;
          errorMessage: string | null;
        }
    );

export const FormInput = (props: FormInputPropsType) => {
  const formInputContainerProps = {
    className: styles.form_input_container,
  };

  const formInputProps: {
    className: string;
    type: string;
    id: string;
    name: string;
    placeholder: string;
    value: string;
    required: boolean;
    disabled: boolean;
    onChange: ChangeEventHandler<HTMLInputElement>;
  } = {
    className: "",
    type: props.type,
    id: props.id,
    name: props.name,
    placeholder: props.placeholder,
    value: props.value,
    required: (() => {
      return props.required === false ? false : true;
    })(),
    disabled: false,
    onChange: () => {},
  };

  if ("isDisabled" in props) {
    formInputProps.disabled = true;
  }

  let errorMessageComponent: JSX.Element | null = null;

  if ("onChange" in props) {
    formInputProps.onChange = props.onChange;
  }

  if ("errorMessage" in props && props.errorMessage) {
    formInputContainerProps.className += " error-text";
    formInputProps.className += "error";
    errorMessageComponent = (
      <div className={styles.form_input_error_message_container}>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21.171,15.398l-5.912-9.854C14.483,4.251,13.296,3.511,12,3.511s-2.483,0.74-3.259,2.031l-5.912,9.856  c-0.786,1.309-0.872,2.705-0.235,3.83C3.23,20.354,4.472,21,6,21h12c1.528,0,2.77-0.646,3.406-1.771  C22.043,18.104,21.957,16.708,21.171,15.398z M12,17.549c-0.854,0-1.55-0.695-1.55-1.549c0-0.855,0.695-1.551,1.55-1.551  s1.55,0.696,1.55,1.551C13.55,16.854,12.854,17.549,12,17.549z M13.633,10.125c-0.011,0.031-1.401,3.468-1.401,3.468  c-0.038,0.094-0.13,0.156-0.231,0.156s-0.193-0.062-0.231-0.156l-1.391-3.438C10.289,9.922,10.25,9.712,10.25,9.5  c0-0.965,0.785-1.75,1.75-1.75s1.75,0.785,1.75,1.75C13.75,9.712,13.711,9.922,13.633,10.125z" />
          </svg>
        </div>
        <p>{props.errorMessage}</p>
      </div>
    );
  }

  return (
    <div {...formInputContainerProps}>
      <label className={styles.form_input_label} htmlFor={props.id}>
        {props.title}
      </label>
      <input {...formInputProps} />
      {errorMessageComponent}
    </div>
  );
};
