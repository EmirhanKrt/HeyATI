CREATE OR REPLACE FUNCTION update_serverusers_role_when_server_owner_id_updated()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public."ServerUser"
    SET "role" = 'user'
    WHERE "server_id" = OLD."server_id" AND "user_id" = OLD."owner_id";

    UPDATE public."ServerUser"
    SET "role" = 'owner'
    WHERE "server_id" = NEW."server_id" AND "user_id" = NEW."owner_id";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_serverusers_role_when_server_owner_id_updated
AFTER UPDATE OF "owner_id" ON public."Server"
FOR EACH ROW
WHEN (OLD."owner_id" IS NOT NULL AND NEW."owner_id" IS NOT NULL AND OLD."owner_id" != NEW."owner_id")
EXECUTE FUNCTION update_serverusers_role_when_server_owner_id_updated();