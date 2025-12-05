import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

function App() {
  const [users, setUser] = useState<{ name: string }[]>([]);

  async function getUsers() {
    const { data } = await supabase.from("users").select();
    setUser(data ?? []);
  }

  useEffect(() => {
    async function fetchUsers() {
      await getUsers();
    }
    fetchUsers();
  }, []);

  return (
    <ul>
      {users.map((instrument) => (
        <li key={instrument.name}>{instrument.name}</li>
      ))}
    </ul>
  );
}

export default App;