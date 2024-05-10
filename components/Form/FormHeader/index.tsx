export const FormHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div className={"form_header_container"}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
};
