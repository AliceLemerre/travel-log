import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { createBrowserClient } from "@supabase/ssr";

export async function loader({}: LoaderFunctionArgs) {
  return {
    env: {
      SUPABASE_URL: import.meta.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: import.meta.env.SUPABASE_ANON_KEY,
    },
  };
}

export default function Index() {
  const { env } = useLoaderData<typeof loader>();

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  return ...
}