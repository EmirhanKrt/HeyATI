CREATE OR REPLACE FUNCTION create_serverUser_serverInviteCode_channel_rows_after_server_row_inserted()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public."ServerUser" ("server_id", "user_id", "role")
    VALUES (NEW."server_id", NEW."owner_id", 'owner');

    INSERT INTO public."ServerInviteCode" ("server_id", "owner_id")
    VALUES (NEW."server_id", NEW."owner_id");

    INSERT INTO public."Channel" ("server_id", "owner_id", "channel_name")
    VALUES (NEW."server_id", NEW."owner_id", 'General');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_serverUser_serverInviteCode_channel_rows_after_server_row_inserted
AFTER INSERT ON public."Server"
FOR EACH ROW
EXECUTE FUNCTION create_serverUser_serverInviteCode_channel_rows_after_server_row_inserted();