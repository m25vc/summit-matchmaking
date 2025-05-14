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
          additional_notes: string | null
          company_description: string
          company_stage: string
          company_website_url: string | null
          current_revenue: string | null
          funding_stage: string
          industry: string
          last_round_raised: string | null
          linkedin_url: string | null
          next_raise_planned: string | null
          profile_id: string
          target_raise_amount: number | null
          team_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          company_description: string
          company_stage: string
          company_website_url?: string | null
          current_revenue?: string | null
          funding_stage: string
          industry: string
          last_round_raised?: string | null
          linkedin_url?: string | null
          next_raise_planned?: string | null
          profile_id: string
          target_raise_amount?: number | null
          team_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          company_description?: string
          company_stage?: string
          company_website_url?: string | null
          current_revenue?: string | null
          funding_stage?: string
          industry?: string
          last_round_raised?: string | null
          linkedin_url?: string | null
          next_raise_planned?: string | null
          profile_id?: string
          target_raise_amount?: number | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "founder_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_details_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_details: {
        Row: {
          additional_notes: string | null
          check_size: string | null
          firm_description: string
          firm_hq: string | null
          firm_website_url: string | null
          geographic_focus: string | null
          investment_thesis: string | null
          linkedin_url: string | null
          max_investment_amount: number | null
          min_investment_amount: number | null
          preferred_industries: string[] | null
          preferred_stages: string[] | null
          profile_id: string
        }
        Insert: {
          additional_notes?: string | null
          check_size?: string | null
          firm_description: string
          firm_hq?: string | null
          firm_website_url?: string | null
          geographic_focus?: string | null
          investment_thesis?: string | null
          linkedin_url?: string | null
          max_investment_amount?: number | null
          min_investment_amount?: number | null
          preferred_industries?: string[] | null
          preferred_stages?: string[] | null
          profile_id: string
        }
        Update: {
          additional_notes?: string | null
          check_size?: string | null
          firm_description?: string
          firm_hq?: string | null
          firm_website_url?: string | null
          geographic_focus?: string | null
          investment_thesis?: string | null
          linkedin_url?: string | null
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
          is_team_match: boolean | null
          not_interested: boolean | null
          priority: Database["public"]["Enums"]["match_priority"]
          set_by: string
        }
        Insert: {
          created_at?: string
          founder_id: string
          id?: string
          investor_id: string
          is_team_match?: boolean | null
          not_interested?: boolean | null
          priority: Database["public"]["Enums"]["match_priority"]
          set_by: string
        }
        Update: {
          created_at?: string
          founder_id?: string
          id?: string
          investor_id?: string
          is_team_match?: boolean | null
          not_interested?: boolean | null
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
      team_members: {
        Row: {
          id: string
          joined_at: string
          profile_id: string
          role: string
          team_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          profile_id: string
          role?: string
          team_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          profile_id?: string
          role?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
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
      delete_priority_match: {
        Args: { p_founder_id: string; p_investor_id: string }
        Returns: undefined
      }
      first_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      set_not_interested: {
        Args: { p_founder_id: string; p_investor_id: string; p_set_by: string }
        Returns: undefined
      }
      set_priority_match: {
        Args: {
          p_founder_id: string
          p_investor_id: string
          p_priority: string
          p_set_by: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      match_priority: ["high", "medium", "low"],
      user_role: ["admin", "user"],
      user_type: ["founder", "investor"],
    },
  },
} as const
