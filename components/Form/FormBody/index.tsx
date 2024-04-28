import styles from "./component.module.css";

export const FormBody = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className={styles.form_body}>{children}</div>;
};
