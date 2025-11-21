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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      blocked_ips: {
        Row: {
          blocked_by: string | null
          created_at: string | null
          id: string
          ip_address: string
          reason: string | null
        }
        Insert: {
          blocked_by?: string | null
          created_at?: string | null
          id?: string
          ip_address: string
          reason?: string | null
        }
        Update: {
          blocked_by?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string
          reason?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          name_en: string
          name_fr: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          name_en: string
          name_fr: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          name_en?: string
          name_fr?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          status: string | null
          subject: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          status?: string | null
          subject: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          status?: string | null
          subject?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      landing_pages: {
        Row: {
          background_color: string | null
          background_gradient_end: string | null
          background_gradient_start: string | null
          background_image_bucket_path: string | null
          background_image_source: string | null
          background_image_url: string | null
          background_type: string
          button_animation: string | null
          button_color: string | null
          button_icon: string | null
          button_text: string | null
          button_url: string | null
          countdown_to: string | null
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          layout_type: string
          logo_url: string | null
          profile_photo_bucket_path: string | null
          profile_photo_source: string | null
          profile_photo_url: string | null
          redirect_delay: number | null
          redirect_mode: string
          short_url_id: string
          show_countdown: boolean | null
          show_location: boolean
          show_url_preview: boolean | null
          show_verified_badge: boolean
          subtitle: string | null
          title: string
          updated_at: string
          user_bio: string | null
          user_name: string | null
        }
        Insert: {
          background_color?: string | null
          background_gradient_end?: string | null
          background_gradient_start?: string | null
          background_image_bucket_path?: string | null
          background_image_source?: string | null
          background_image_url?: string | null
          background_type?: string
          button_animation?: string | null
          button_color?: string | null
          button_icon?: string | null
          button_text?: string | null
          button_url?: string | null
          countdown_to?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          layout_type?: string
          logo_url?: string | null
          profile_photo_bucket_path?: string | null
          profile_photo_source?: string | null
          profile_photo_url?: string | null
          redirect_delay?: number | null
          redirect_mode?: string
          short_url_id: string
          show_countdown?: boolean | null
          show_location?: boolean
          show_url_preview?: boolean | null
          show_verified_badge?: boolean
          subtitle?: string | null
          title?: string
          updated_at?: string
          user_bio?: string | null
          user_name?: string | null
        }
        Update: {
          background_color?: string | null
          background_gradient_end?: string | null
          background_gradient_start?: string | null
          background_image_bucket_path?: string | null
          background_image_source?: string | null
          background_image_url?: string | null
          background_type?: string
          button_animation?: string | null
          button_color?: string | null
          button_icon?: string | null
          button_text?: string | null
          button_url?: string | null
          countdown_to?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          layout_type?: string
          logo_url?: string | null
          profile_photo_bucket_path?: string | null
          profile_photo_source?: string | null
          profile_photo_url?: string | null
          redirect_delay?: number | null
          redirect_mode?: string
          short_url_id?: string
          show_countdown?: boolean | null
          show_location?: boolean
          show_url_preview?: boolean | null
          show_verified_badge?: boolean
          subtitle?: string | null
          title?: string
          updated_at?: string
          user_bio?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_short_url_id_fkey"
            columns: ["short_url_id"]
            isOneToOne: false
            referencedRelation: "shortened_urls"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          category_id: string | null
          clicks: number | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string
          shares: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          category_id?: string | null
          clicks?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url: string
          shares?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          category_id?: string | null
          clicks?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string
          shares?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      shortened_urls: {
        Row: {
          blocked_countries: string[] | null
          blocked_ips: string[] | null
          clicks: number | null
          created_at: string
          custom_code: string | null
          description: string | null
          direct_link: boolean | null
          expires_at: string | null
          id: string
          last_clicked_at: string | null
          original_url: string
          password_hash: string | null
          short_code: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blocked_countries?: string[] | null
          blocked_ips?: string[] | null
          clicks?: number | null
          created_at?: string
          custom_code?: string | null
          description?: string | null
          direct_link?: boolean | null
          expires_at?: string | null
          id?: string
          last_clicked_at?: string | null
          original_url: string
          password_hash?: string | null
          short_code: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blocked_countries?: string[] | null
          blocked_ips?: string[] | null
          clicks?: number | null
          created_at?: string
          custom_code?: string | null
          description?: string | null
          direct_link?: boolean | null
          expires_at?: string | null
          id?: string
          last_clicked_at?: string | null
          original_url?: string
          password_hash?: string | null
          short_code?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          active: boolean | null
          created_at: string | null
          icon: string
          id: string
          order_index: number | null
          platform: string
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          icon: string
          id?: string
          order_index?: number | null
          platform: string
          url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          icon?: string
          id?: string
          order_index?: number | null
          platform?: string
          url?: string
        }
        Relationships: []
      }
      url_clicks: {
        Row: {
          browser: string | null
          clicked_at: string | null
          device: string | null
          id: string
          ip: string | null
          location_city: string | null
          location_country: string | null
          os: string | null
          referrer: string | null
          short_url_id: string | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          clicked_at?: string | null
          device?: string | null
          id?: string
          ip?: string | null
          location_city?: string | null
          location_country?: string | null
          os?: string | null
          referrer?: string | null
          short_url_id?: string | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          clicked_at?: string | null
          device?: string | null
          id?: string
          ip?: string | null
          location_city?: string | null
          location_country?: string | null
          os?: string | null
          referrer?: string | null
          short_url_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "url_clicks_short_url_id_fkey"
            columns: ["short_url_id"]
            isOneToOne: false
            referencedRelation: "shortened_urls"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_redirect_url: {
        Args: { p_code: string; p_password?: string }
        Returns: {
          blocked_countries: string[]
          blocked_ips: string[]
          direct_link: boolean
          expires_at: string
          id: string
          is_blocked: boolean
          original_url: string
          requires_password: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_photo_clicks: { Args: { photo_id: string }; Returns: undefined }
      increment_photo_shares: { Args: { photo_id: string }; Returns: undefined }
      increment_photo_views: { Args: { photo_id: string }; Returns: undefined }
      increment_url_clicks: {
        Args: { p_short_code: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
