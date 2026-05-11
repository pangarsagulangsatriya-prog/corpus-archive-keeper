import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yvdkrhqbuknjvdqyxoaw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZGtyaHFidWtuanZkcXl4b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0ODMzNjEsImV4cCI6MjA5NDA1OTM2MX0.vpcXTxBUsYHHZ8H_-rGKOVj1kmkq1yVLhtazfYAKqiM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


