import { loadEnvFile } from "process";

loadEnvFile(".env.local");

console.log(process.env.SUPABASE_SERVICE_ROLE_KEY)
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)