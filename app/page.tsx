import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import LogOutButton from "@/components/LogOutButton";
import FileUploadComponent from "@/components/FileUpload";

const getUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) redirect("/login");

  const fetchUserRequest = await api.user.me.get({
    headers: { cookie: "token=" + token.value },
  });

  if (fetchUserRequest.error) redirect("/login");

  return fetchUserRequest.data.data.user;
};

const Home = async () => {
  const user = await getUser();

  return (
    <main>
      main pages {user.first_name} <LogOutButton />
      <FileUploadComponent />
    </main>
  );
};

export default Home;
