export type Json =
  | ({ toJson(): string } | string | number | boolean | null)
  | { [key: string]: Json }
  | Json[]
