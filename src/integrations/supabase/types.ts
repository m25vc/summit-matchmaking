export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      founder_details: {
        Row: {
          company_description: string
          company_stage: string
          company_website_url: string | null
          funding_stage: string
          industry: string
          profile_id: string
          target_raise_amount: number | null
        }
        Insert: {
          company_description: string
          company_stage: string
          company_website_url?: string | null
          funding_stage: string
          industry: string
          profile_id: string
          target_raise_amount?: number | null
        }
        Update: {
          company_description?: string
          company_stage?: string
          company_website_url?: string | null
          funding_stage?: string
          industry?: string
          profile_id?: string
          target_raise_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_details: {
        Row: {
          firm_description: string
          firm_website_url: string | null
          investment_thesis: string | null
          max_investment_amount: number | null
          min_investment_amount: number | null
          preferred_industries: string[] | null
          preferred_stages: string[] | null
          profile_id: string
        }
        Insert: {
          firm_description: string
          firm_website_url?: string | null
          investment_thesis?: string | null
          max_investment_amount?: number | null
          min_investment_amount?: number | null
          preferred_industries?: string[] | null
          preferred_stages?: string[] | null
          profile_id: string
        }
        Update: {
          firm_description?: string
          firm_website_url?: string | null
          investment_thesis?: string | null
          max_investment_amount?: number | null
          min_investment_amount?: number | null
          preferred_industries?: string[] | null
          preferred_stages?: string[] | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          founder_id: string | null
          founder_interest: boolean | null
          id: string
          investor_id: string | null
          investor_interest: boolean | null
          match_score: number | null
          matched_at: string
        }
        Insert: {
          founder_id?: string | null
          founder_interest?: boolean | null
          id?: string
          investor_id?: string | null
          investor_interest?: boolean | null
          match_score?: number | null
          matched_at?: string
        }
        Update: {
          founder_id?: string | null
          founder_interest?: boolean | null
          id?: string
          investor_id?: string | null
          investor_interest?: boolean | null
          match_score?: number | null
          matched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      priority_matches: {
        Row: {
          created_at: string
          founder_id: string
          id: string
          investor_id: string
          priority: Database["public"]["Enums"]["match_priority"]
          set_by: string
        }
        Insert: {
          created_at?: string
          founder_id: string
          id?: string
          investor_id: string
          priority: Database["public"]["Enums"]["match_priority"]
          set_by: string
        }
        Update: {
          created_at?: string
          founder_id?: string
          id?: string
          investor_id?: string
          priority?: Database["public"]["Enums"]["match_priority"]
          set_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "priority_matches_initiator_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "priority_matches_set_by_fkey"
            columns: ["set_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "priority_matches_target_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          company_name: string
          created_at: string
          email: string | null
          first_name: string
          id: string
          job_title: string
          last_name: string
          linkedin_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          bio?: string | null
          company_name: string
          created_at?: string
          email?: string | null
          first_name: string
          id: string
          job_title: string
          last_name: string
          linkedin_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          bio?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          job_title?: string
          last_name?: string
          linkedin_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      match_scores: {
        Row: {
          created_at: string | null
          founder_id: string | null
          has_mutual_match: boolean | null
          id: string | null
          investor_id: string | null
          priority: Database["public"]["Enums"]["match_priority"] | null
          score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_match_score: {
        Args: {
          has_mutual_match: boolean
          priority1: Database["public"]["Enums"]["match_priority"]
          priority2: Database["public"]["Enums"]["match_priority"]
        }
        Returns: number
      }
      make_user_admin: {
        Args: {
          user_email: string
        }
        Returns: undefined
      }
    }
    Enums: {
      match_priority: "high" | "medium" | "low"
      user_role: "admin" | "user"
      user_type: "founder" | "investor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
