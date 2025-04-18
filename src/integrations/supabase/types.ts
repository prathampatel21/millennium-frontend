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
      app_user: {
        Row: {
          account_balance: number
          username: string
        }
        Insert: {
          account_balance?: number
          username: string
        }
        Update: {
          account_balance?: number
          username?: string
        }
        Relationships: []
      }
      asset: {
        Row: {
          assetid: number
          shares: number
          ticker: string
          username: string
        }
        Insert: {
          assetid?: number
          shares: number
          ticker: string
          username: string
        }
        Update: {
          assetid?: number
          shares?: number
          ticker?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["username"]
          },
        ]
      }
      child_order: {
        Row: {
          corderid: number
          porderid: number
          price: number
          shares: number
          status: Database["public"]["Enums"]["order_status"]
          time: string
          transactionid: number | null
          type: Database["public"]["Enums"]["order_type"]
        }
        Insert: {
          corderid?: number
          porderid: number
          price: number
          shares: number
          status: Database["public"]["Enums"]["order_status"]
          time: string
          transactionid?: number | null
          type: Database["public"]["Enums"]["order_type"]
        }
        Update: {
          corderid?: number
          porderid?: number
          price?: number
          shares?: number
          status?: Database["public"]["Enums"]["order_status"]
          time?: string
          transactionid?: number | null
          type?: Database["public"]["Enums"]["order_type"]
        }
        Relationships: [
          {
            foreignKeyName: "child_order_porderid_fkey"
            columns: ["porderid"]
            isOneToOne: false
            referencedRelation: "order_book"
            referencedColumns: ["porderid"]
          },
          {
            foreignKeyName: "child_order_porderid_fkey"
            columns: ["porderid"]
            isOneToOne: false
            referencedRelation: "parent_order"
            referencedColumns: ["porderid"]
          },
          {
            foreignKeyName: "child_order_porderid_fkey"
            columns: ["porderid"]
            isOneToOne: false
            referencedRelation: "user_completed_orders"
            referencedColumns: ["parent_order_id"]
          },
          {
            foreignKeyName: "child_order_porderid_fkey"
            columns: ["porderid"]
            isOneToOne: false
            referencedRelation: "user_order_status"
            referencedColumns: ["parent_order_id"]
          },
          {
            foreignKeyName: "child_order_transactionid_fkey"
            columns: ["transactionid"]
            isOneToOne: false
            referencedRelation: "transaction"
            referencedColumns: ["transactionid"]
          },
        ]
      }
      parent_order: {
        Row: {
          amount: number
          porderid: number
          shares: number
          ticker: string
          time: string
          total_status: Database["public"]["Enums"]["order_status"]
          type: Database["public"]["Enums"]["order_type"]
          username: string
        }
        Insert: {
          amount: number
          porderid?: number
          shares: number
          ticker: string
          time: string
          total_status: Database["public"]["Enums"]["order_status"]
          type: Database["public"]["Enums"]["order_type"]
          username: string
        }
        Update: {
          amount?: number
          porderid?: number
          shares?: number
          ticker?: string
          time?: string
          total_status?: Database["public"]["Enums"]["order_status"]
          type?: Database["public"]["Enums"]["order_type"]
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_order_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["username"]
          },
        ]
      }
      transaction: {
        Row: {
          buyer_username: string
          completed_time: string
          seller_username: string
          transactionid: number
        }
        Insert: {
          buyer_username: string
          completed_time: string
          seller_username: string
          transactionid?: number
        }
        Update: {
          buyer_username?: string
          completed_time?: string
          seller_username?: string
          transactionid?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_buyer_username_fkey"
            columns: ["buyer_username"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["username"]
          },
          {
            foreignKeyName: "transaction_seller_username_fkey"
            columns: ["seller_username"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["username"]
          },
        ]
      }
    }
    Views: {
      order_book: {
        Row: {
          corderid: number | null
          porderid: number | null
          price: number | null
          shares: number | null
          ticker: string | null
          time: string | null
          type: Database["public"]["Enums"]["order_type"] | null
        }
        Relationships: []
      }
      user_completed_orders: {
        Row: {
          amount: number | null
          order_time: string | null
          order_type: Database["public"]["Enums"]["order_type"] | null
          parent_order_id: number | null
          shares: number | null
          ticker: string | null
          total_status: Database["public"]["Enums"]["order_status"] | null
          username: string | null
        }
        Insert: {
          amount?: number | null
          order_time?: string | null
          order_type?: Database["public"]["Enums"]["order_type"] | null
          parent_order_id?: number | null
          shares?: number | null
          ticker?: string | null
          total_status?: Database["public"]["Enums"]["order_status"] | null
          username?: string | null
        }
        Update: {
          amount?: number | null
          order_time?: string | null
          order_type?: Database["public"]["Enums"]["order_type"] | null
          parent_order_id?: number | null
          shares?: number | null
          ticker?: string | null
          total_status?: Database["public"]["Enums"]["order_status"] | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_order_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["username"]
          },
        ]
      }
      user_order_status: {
        Row: {
          child_order_id: number | null
          child_shares: number | null
          child_status: Database["public"]["Enums"]["order_status"] | null
          execution_price: number | null
          last_update_time: string | null
          order_placement_time: string | null
          order_stage: string | null
          order_type: Database["public"]["Enums"]["order_type"] | null
          parent_order_id: number | null
          parent_status: Database["public"]["Enums"]["order_status"] | null
          ticker: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_order_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["username"]
          },
        ]
      }
    }
    Functions: {
      complete_child_order: {
        Args: { in_corderid: number }
        Returns: undefined
      }
      complete_parent_order: {
        Args: { in_porderid: number }
        Returns: undefined
      }
      create_child_order: {
        Args: { p_porderid: number; c_price: number; c_shares: number }
        Returns: undefined
      }
      create_parent_order: {
        Args: {
          p_ticker: string
          p_shares: number
          p_type: Database["public"]["Enums"]["order_type"]
          p_amount: number
          p_username: string
        }
        Returns: undefined
      }
      create_user: {
        Args: { p_username: string; initial_balance: number }
        Returns: undefined
      }
      get_user_balance: {
        Args: { p_username: string }
        Returns: {
          balance: number
        }[]
      }
      update_user_balance: {
        Args: { target_username: string; new_balance: number }
        Returns: undefined
      }
    }
    Enums: {
      order_status: "pending" | "completed"
      order_type: "buy" | "sell"
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
      order_status: ["pending", "completed"],
      order_type: ["buy", "sell"],
    },
  },
} as const
