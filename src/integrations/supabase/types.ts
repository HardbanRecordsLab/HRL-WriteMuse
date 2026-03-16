export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chapter_comments: {
        Row: {
          chapter_id: string
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          position_end: number | null
          position_start: number | null
          quoted_text: string | null
          status: Database["public"]["Enums"]["comment_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chapter_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          position_end?: number | null
          position_start?: number | null
          quoted_text?: string | null
          status?: Database["public"]["Enums"]["comment_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          position_end?: number | null
          position_start?: number | null
          quoted_text?: string | null
          status?: Database["public"]["Enums"]["comment_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_comments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chapter_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_versions: {
        Row: {
          chapter_id: string
          content: string | null
          created_at: string | null
          created_by: string
          id: string
          label: string | null
          version_number: number
          version_type: Database["public"]["Enums"]["version_type"] | null
          word_count: number | null
        }
        Insert: {
          chapter_id: string
          content?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          label?: string | null
          version_number: number
          version_type?: Database["public"]["Enums"]["version_type"] | null
          word_count?: number | null
        }
        Update: {
          chapter_id?: string
          content?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          label?: string | null
          version_number?: number
          version_type?: Database["public"]["Enums"]["version_type"] | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_versions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          content: string | null
          created_at: string | null
          document_id: string
          id: string
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          document_id: string
          id?: string
          order_index: number
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          document_id?: string
          id?: string
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_templates: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_premium: boolean | null
          layout_data: Json | null
          name: string
          preview_url: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          layout_data?: Json | null
          name: string
          preview_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          layout_data?: Json | null
          name?: string
          preview_url?: string | null
        }
        Relationships: []
      }
      distribution_platforms: {
        Row: {
          created_at: string | null
          description: string | null
          formats: string[] | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          formats?: string[] | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          formats?: string[] | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      document_collaborators: {
        Row: {
          accepted_at: string | null
          document_id: string
          email: string
          id: string
          invited_at: string | null
          invited_by: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["collaborator_role"] | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          document_id: string
          email: string
          id?: string
          invited_at?: string | null
          invited_by: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["collaborator_role"] | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          document_id?: string
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["collaborator_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_collaborators_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_covers: {
        Row: {
          author_name: string | null
          background_image_url: string | null
          created_at: string | null
          design_data: Json | null
          document_id: string
          final_image_url: string | null
          id: string
          status: Database["public"]["Enums"]["cover_status"] | null
          subtitle: string | null
          template_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          background_image_url?: string | null
          created_at?: string | null
          design_data?: Json | null
          document_id: string
          final_image_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["cover_status"] | null
          subtitle?: string | null
          template_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          background_image_url?: string | null
          created_at?: string | null
          design_data?: Json | null
          document_id?: string
          final_image_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["cover_status"] | null
          subtitle?: string | null
          template_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_covers_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_covers_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cover_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      document_distributions: {
        Row: {
          created_at: string | null
          document_id: string
          external_id: string | null
          external_url: string | null
          id: string
          metadata: Json | null
          platform_id: string
          published_at: string | null
          status: Database["public"]["Enums"]["distribution_status"] | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id: string
          external_id?: string | null
          external_url?: string | null
          id?: string
          metadata?: Json | null
          platform_id: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["distribution_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          external_id?: string | null
          external_url?: string | null
          id?: string
          metadata?: Json | null
          platform_id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["distribution_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_distributions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_distributions_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "distribution_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          settings: Json | null
          status: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["document_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      illustrations: {
        Row: {
          chapter_id: string
          created_at: string | null
          id: string
          image_url: string | null
          position_in_chapter: number | null
          prompt: string
          status: Database["public"]["Enums"]["illustration_status"] | null
          updated_at: string | null
        }
        Insert: {
          chapter_id: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          position_in_chapter?: number | null
          prompt: string
          status?: Database["public"]["Enums"]["illustration_status"] | null
          updated_at?: string | null
        }
        Update: {
          chapter_id?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          position_in_chapter?: number | null
          prompt?: string
          status?: Database["public"]["Enums"]["illustration_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illustrations_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payout_method: string | null
          period_end: string | null
          period_start: string | null
          processed_at: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payout_method?: string | null
          period_end?: string | null
          period_start?: string | null
          processed_at?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payout_method?: string | null
          period_end?: string | null
          period_start?: string | null
          processed_at?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          user_id?: string
        }
        Relationships: []
      }
      royalty_splits: {
        Row: {
          created_at: string | null
          document_id: string
          email: string
          id: string
          is_active: boolean | null
          name: string
          percentage: number
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          percentage: number
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          percentage?: number
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "royalty_splits_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_data: {
        Row: {
          country: string | null
          created_at: string | null
          currency: string | null
          document_id: string
          format: string | null
          id: string
          metadata: Json | null
          platform_id: string | null
          revenue: number | null
          royalty_amount: number | null
          sale_date: string
          units_sold: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          currency?: string | null
          document_id: string
          format?: string | null
          id?: string
          metadata?: Json | null
          platform_id?: string | null
          revenue?: number | null
          royalty_amount?: number | null
          sale_date: string
          units_sold?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          currency?: string | null
          document_id?: string
          format?: string | null
          id?: string
          metadata?: Json | null
          platform_id?: string | null
          revenue?: number | null
          royalty_amount?: number | null
          sale_date?: string
          units_sold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_data_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_data_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "distribution_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      collaborator_role: "viewer" | "editor" | "reviewer" | "admin"
      comment_status: "open" | "resolved" | "rejected"
      cover_status: "draft" | "generating" | "completed" | "failed"
      distribution_status:
        | "draft"
        | "pending"
        | "published"
        | "rejected"
        | "archived"
      document_status: "draft" | "in_progress" | "completed" | "published"
      illustration_status: "pending" | "generating" | "completed" | "failed"
      payment_status: "pending" | "processing" | "completed" | "failed"
      royalty_status: "pending" | "confirmed" | "paid"
      version_type: "auto" | "manual" | "milestone"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      collaborator_role: ["viewer", "editor", "reviewer", "admin"],
      comment_status: ["open", "resolved", "rejected"],
      cover_status: ["draft", "generating", "completed", "failed"],
      distribution_status: [
        "draft",
        "pending",
        "published",
        "rejected",
        "archived",
      ],
      document_status: ["draft", "in_progress", "completed", "published"],
      illustration_status: ["pending", "generating", "completed", "failed"],
      payment_status: ["pending", "processing", "completed", "failed"],
      royalty_status: ["pending", "confirmed", "paid"],
      version_type: ["auto", "manual", "milestone"],
    },
  },
} as const
