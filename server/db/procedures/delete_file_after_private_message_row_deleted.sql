CREATE OR REPLACE FUNCTION delete_file_after_private_message_row_deleted()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public."File"
    WHERE file_id = OLD."file_id";
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_file_after_private_message_row_deleted
AFTER DELETE ON public."PrivateMessageFile"
FOR EACH ROW
EXECUTE FUNCTION delete_file_after_private_message_row_deleted();