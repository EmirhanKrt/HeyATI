import styles from "./component.module.css";

export const FormHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div className={styles.form_header_container}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
};
