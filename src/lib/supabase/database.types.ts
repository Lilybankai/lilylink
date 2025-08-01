export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      link_clicks: {
        Row: {
          city: string | null
          clicked_at: string | null
          country: string | null
          id: string
          ip_address: unknown | null
          link_id: string
          page_id: string
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          city?: string | null
          clicked_at?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown | null
          link_id: string
          page_id: string
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          city?: string | null
          clicked_at?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown | null
          link_id?: string
          page_id?: string
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_clicks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "link_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      link_pages: {
        Row: {
          background_config: Json | null
          background_type: string | null
          background_value: string | null
          brand_config: Json | null
          created_at: string | null
          custom_css: string | null
          description: string | null
          favicon_url: string | null
          font_family: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          layout_config: Json | null
          og_image_url: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          theme_config: Json | null
          theme_id: string | null
          title: string
          typography_config: Json | null
          updated_at: string | null
          user_id: string
          user_theme_id: string | null
        }
        Insert: {
          background_config?: Json | null
          background_type?: string | null
          background_value?: string | null
          brand_config?: Json | null
          created_at?: string | null
          custom_css?: string | null
          description?: string | null
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          layout_config?: Json | null
          og_image_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          theme_config?: Json | null
          theme_id?: string | null
          title: string
          typography_config?: Json | null
          updated_at?: string | null
          user_id: string
          user_theme_id?: string | null
        }
        Update: {
          background_config?: Json | null
          background_type?: string | null
          background_value?: string | null
          brand_config?: Json | null
          created_at?: string | null
          custom_css?: string | null
          description?: string | null
          favicon_url?: string | null
          font_family?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          layout_config?: Json | null
          og_image_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          theme_config?: Json | null
          theme_id?: string | null
          title?: string
          typography_config?: Json | null
          updated_at?: string | null
          user_id?: string
          user_theme_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_pages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_pages_user_theme_id_fkey"
            columns: ["user_theme_id"]
            isOneToOne: false
            referencedRelation: "user_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          affiliate_id: string | null
          auto_play: boolean | null
          button_color: string | null
          calendar_link: string | null
          click_count: number | null
          commission_rate: number | null
          contact_type: string | null
          created_at: string | null
          description: string | null
          display_order: number
          email_address: string | null
          external_id: string | null
          form_fields: Json | null
          icon_color: string | null
          icon_name: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          link_type: string | null
          media_duration: number | null
          media_embed_id: string | null
          media_platform: string | null
          metadata: Json | null
          page_id: string
          payment_amount: number | null
          payment_currency: string | null
          payment_type: string | null
          phone_number: string | null
          product_availability: string | null
          product_currency: string | null
          product_price: number | null
          schedule_end: string | null
          schedule_start: string | null
          social_follower_count: number | null
          social_handle: string | null
          social_platform: string | null
          style_options: Json | null
          text_color: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          affiliate_id?: string | null
          auto_play?: boolean | null
          button_color?: string | null
          calendar_link?: string | null
          click_count?: number | null
          commission_rate?: number | null
          contact_type?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          email_address?: string | null
          external_id?: string | null
          form_fields?: Json | null
          icon_color?: string | null
          icon_name?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          link_type?: string | null
          media_duration?: number | null
          media_embed_id?: string | null
          media_platform?: string | null
          metadata?: Json | null
          page_id: string
          payment_amount?: number | null
          payment_currency?: string | null
          payment_type?: string | null
          phone_number?: string | null
          product_availability?: string | null
          product_currency?: string | null
          product_price?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          social_follower_count?: number | null
          social_handle?: string | null
          social_platform?: string | null
          style_options?: Json | null
          text_color?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          affiliate_id?: string | null
          auto_play?: boolean | null
          button_color?: string | null
          calendar_link?: string | null
          click_count?: number | null
          commission_rate?: number | null
          contact_type?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          email_address?: string | null
          external_id?: string | null
          form_fields?: Json | null
          icon_color?: string | null
          icon_name?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          link_type?: string | null
          media_duration?: number | null
          media_embed_id?: string | null
          media_platform?: string | null
          metadata?: Json | null
          page_id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          payment_type?: string | null
          phone_number?: string | null
          product_availability?: string | null
          product_currency?: string | null
          product_price?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          social_follower_count?: number | null
          social_handle?: string | null
          social_platform?: string | null
          style_options?: Json | null
          text_color?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "link_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      media_platforms: {
        Row: {
          api_endpoint: string | null
          created_at: string | null
          display_name: string
          domain: string
          embed_pattern: string
          id: string
          max_duration_seconds: number | null
          name: string
          requires_api_key: boolean | null
          supports_auto_play: boolean | null
        }
        Insert: {
          api_endpoint?: string | null
          created_at?: string | null
          display_name: string
          domain: string
          embed_pattern: string
          id?: string
          max_duration_seconds?: number | null
          name: string
          requires_api_key?: boolean | null
          supports_auto_play?: boolean | null
        }
        Update: {
          api_endpoint?: string | null
          created_at?: string | null
          display_name?: string
          domain?: string
          embed_pattern?: string
          id?: string
          max_duration_seconds?: number | null
          name?: string
          requires_api_key?: boolean | null
          supports_auto_play?: boolean | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          city: string | null
          country: string | null
          id: string
          ip_address: unknown | null
          page_id: string
          referrer: string | null
          session_duration: number | null
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown | null
          page_id: string
          referrer?: string | null
          session_duration?: number | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: unknown | null
          page_id?: string
          referrer?: string | null
          session_duration?: number | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "link_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          analytics_enabled: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          custom_domain: string | null
          display_name: string | null
          id: string
          is_verified: boolean | null
          location: string | null
          subscription_tier: string | null
          theme_preferences: Json | null
          updated_at: string | null
          username: string
          website_url: string | null
        }
        Insert: {
          analytics_enabled?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          custom_domain?: string | null
          display_name?: string | null
          id: string
          is_verified?: boolean | null
          location?: string | null
          subscription_tier?: string | null
          theme_preferences?: Json | null
          updated_at?: string | null
          username: string
          website_url?: string | null
        }
        Update: {
          analytics_enabled?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          custom_domain?: string | null
          display_name?: string | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          subscription_tier?: string | null
          theme_preferences?: Json | null
          updated_at?: string | null
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      social_platforms: {
        Row: {
          brand_color: string
          created_at: string | null
          display_name: string
          domain: string
          icon_name: string
          id: string
          is_active: boolean | null
          name: string
          url_pattern: string
        }
        Insert: {
          brand_color: string
          created_at?: string | null
          display_name: string
          domain: string
          icon_name: string
          id?: string
          is_active?: boolean | null
          name: string
          url_pattern: string
        }
        Update: {
          brand_color?: string
          created_at?: string | null
          display_name?: string
          domain?: string
          icon_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          url_pattern?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          category: string
          config: Json
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          preview_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          config: Json
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          preview_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          config?: Json
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          preview_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_themes: {
        Row: {
          created_at: string | null
          custom_config: Json | null
          id: string
          is_default: boolean | null
          name: string
          theme_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_config?: Json | null
          id?: string
          is_default?: boolean | null
          name: string
          theme_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_config?: Json | null
          id?: string
          is_default?: boolean | null
          name?: string
          theme_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_themes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const 