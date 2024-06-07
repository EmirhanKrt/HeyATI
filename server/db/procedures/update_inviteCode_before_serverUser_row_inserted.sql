CREATE OR REPLACE FUNCTION update_inviteCode_before_serverUser_row_inserted()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.server_invite_code_id IS NOT NULL THEN
        PERFORM 1 FROM public."ServerInviteCode" WHERE server_invite_code_id = NEW.server_invite_code_id AND due_date < NOW();
        IF FOUND THEN
            UPDATE public."ServerInviteCode" SET is_in_use = FALSE WHERE server_invite_code_id = NEW.server_invite_code_id;
            RETURN NULL;
        END IF;

        PERFORM 1 FROM public."ServerInviteCode" WHERE server_invite_code_id = NEW.server_invite_code_id AND max_use_count = total_use_count;
        IF FOUND THEN
            UPDATE public."ServerInviteCode" SET is_in_use = FALSE WHERE server_invite_code_id = NEW.server_invite_code_id;
            RETURN NULL;
        END IF;
    END IF;

    UPDATE public."ServerInviteCode" SET total_use_count = total_use_count + 1 WHERE server_invite_code_id = NEW.server_invite_code_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inviteCode_before_serverUser_row_inserted
BEFORE INSERT ON public."ServerUser"
FOR EACH ROW
EXECUTE FUNCTION update_inviteCode_before_serverUser_row_inserted();
