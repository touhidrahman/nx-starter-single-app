CREATE TYPE "audit_log_action" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "feedback_status_enum" AS ENUM('pending', 'inprogress', 'complete', 'incomplete');--> statement-breakpoint
CREATE TYPE "feedback_type_enum" AS ENUM('feature', 'general', 'testimonial', 'issue');--> statement-breakpoint
CREATE TYPE "fileType" AS ENUM('image', 'document', 'video', 'audio');--> statement-breakpoint
CREATE TYPE "occurance_frequency_enum" AS ENUM('Daily', 'Weekly', 'Monthly', 'Yearly');--> statement-breakpoint
CREATE TABLE "account_types" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY,
	"type" text NOT NULL,
	"name" text,
	"balance" numeric DEFAULT '0.00' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"use_for_net_worth" boolean DEFAULT true NOT NULL,
	"monthly_budget" numeric,
	"is_private" boolean DEFAULT false NOT NULL,
	"icon" text,
	"color" text,
	"bank_account_owner_name" text,
	"bank_account_number" text,
	"bank_account_type" text,
	"bank_iban" text,
	"bank_name" text,
	"bank_routing" text,
	"bank_swift_code" text,
	"card_expiry_date" date,
	"card_holder_name" text,
	"card_limit" numeric,
	"card_monthly_due_date" integer,
	"card_monthly_statement_date" integer,
	"card_number" text,
	"card_type" text,
	"loan_end_date" date,
	"loan_interest_rate" numeric,
	"loan_monthly_due_date" integer,
	"loan_start_date" date,
	"group_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" text PRIMARY KEY,
	"name" text,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"last_login" timestamp with time zone,
	"banned_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY,
	"entity" varchar(100) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"creator_id" varchar(100) NOT NULL,
	"group_id" varchar(100),
	"action" "audit_log_action" NOT NULL,
	"previous_data" jsonb DEFAULT '{}',
	"updated_data" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "balance_transfer_schedules" (
	"id" text PRIMARY KEY,
	"from_account_id" text NOT NULL,
	"to_account_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"title" text,
	"note" text,
	"category_id" text,
	"subcategory_id" text,
	"creator_id" text,
	"group_id" text NOT NULL,
	"cron_expression" text NOT NULL,
	"next_occurrence_at" timestamp with time zone NOT NULL,
	"stop_occurrence_at" timestamp with time zone,
	"occurrences_total" integer,
	"occurrences_done" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "balance_transfers" (
	"id" text PRIMARY KEY,
	"from_account_id" text NOT NULL,
	"to_account_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"title" text,
	"note" text,
	"committed_at" timestamp with time zone NOT NULL,
	"out_transaction_id" text,
	"in_transaction_id" text,
	"category_id" text,
	"subcategory_id" text,
	"creator_id" text,
	"group_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"icon" text,
	"color" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"group_id" text,
	"creator_id" text
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"symbol" text DEFAULT '$',
	"conversion_rate_usd" numeric DEFAULT '1.00' NOT NULL,
	"group_id" text,
	"creator_id" text
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY,
	"feedback_text" text NOT NULL,
	"feedback_type" "feedback_type_enum",
	"status" "feedback_status_enum" DEFAULT 'pending'::"feedback_status_enum",
	"active_page" text,
	"file_urls" text[],
	"creator_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address1" text,
	"address2" text,
	"city" text,
	"state" text,
	"country" text,
	"zip" text,
	"creator_id" text,
	"verified_on" timestamp with time zone,
	"subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL,
	"group_id" text NOT NULL,
	"role_id" text,
	"invited_by" text NOT NULL,
	"invited_on" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"user_id" text,
	"group_id" text,
	"role_id" text,
	CONSTRAINT "memberships_pkey" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "pricing_plan" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"monthly_price" integer NOT NULL,
	"yearly_price" integer NOT NULL,
	"discount_price" integer,
	"discount_period_start" date,
	"discount_period_end" date,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"storage_limit" bigint NOT NULL,
	"max_users" integer NOT NULL,
	"active_features" text[],
	"inactive_features" text[],
	"trial_period_days" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY,
	"referral_code_id" text NOT NULL,
	"referred_id" text,
	"points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"group_id" text NOT NULL,
	"referral_code" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"group_id" text,
	"permissions" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "storage" (
	"id" text PRIMARY KEY,
	"filename" text,
	"url" text,
	"type" "fileType" DEFAULT 'image'::"fileType",
	"extension" text,
	"size" integer DEFAULT 0,
	"group_id" text NOT NULL,
	"uploaded_by" text,
	"entity_name" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subcategories" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"icon" text,
	"color" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"group_id" text,
	"creator_id" text,
	"category_id" text
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY,
	"group_id" text NOT NULL UNIQUE,
	"plan_id" text NOT NULL,
	"creator_id" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"is_trial" boolean DEFAULT false NOT NULL,
	"auto_renewal" boolean DEFAULT false NOT NULL,
	"payment_method" text,
	"transaction_id" text,
	"used_storage" integer DEFAULT 0 NOT NULL,
	"approved_at" timestamp with time zone,
	"approver_id" text,
	"billing_interval_months" integer DEFAULT 1 NOT NULL,
	"history" jsonb DEFAULT '"{}"' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transaction_schedules" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"title" text,
	"note" text,
	"is_outgoing" boolean DEFAULT true NOT NULL,
	"category_id" text,
	"subcategory_id" text,
	"creator_id" text,
	"group_id" text NOT NULL,
	"occurance_frequency" "occurance_frequency_enum" NOT NULL,
	"on_day_of_week" integer,
	"on_day_of_month" integer,
	"on_month_of_year" integer,
	"next_occurrence_at" timestamp with time zone NOT NULL,
	"stop_occurrence_at" timestamp with time zone,
	"occurrences_total" integer DEFAULT -1 NOT NULL,
	"occurrences_done" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"title" text,
	"note" text,
	"is_outgoing" boolean DEFAULT true NOT NULL,
	"category_id" text,
	"subcategory_id" text,
	"committed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"creator_id" text,
	"group_id" text NOT NULL,
	"transaction_schedule_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users_settings" (
	"user_id" text,
	"key" text,
	"value" text NOT NULL,
	CONSTRAINT "users_settings_pkey" PRIMARY KEY("user_id","key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"default_group_id" text,
	"cover_photo" text,
	"profile_photo" text,
	"email" text,
	"password" text NOT NULL,
	"phone" text,
	"address1" text,
	"address2" text,
	"city" text,
	"state" text,
	"country" text,
	"zip" text,
	"last_login" timestamp with time zone,
	"banned_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "adminEmailUniqueIndex" ON "admins" (lower("email"));--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_type_account_types_id_fkey" FOREIGN KEY ("type") REFERENCES "account_types"("id");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_from_account_id_accounts_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_to_account_id_accounts_id_fkey" FOREIGN KEY ("to_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_subcategory_id_categories_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_from_account_id_accounts_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_to_account_id_accounts_id_fkey" FOREIGN KEY ("to_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_out_transaction_id_transactions_id_fkey" FOREIGN KEY ("out_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_in_transaction_id_transactions_id_fkey" FOREIGN KEY ("in_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_subcategory_id_categories_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "currencies" ADD CONSTRAINT "currencies_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "currencies" ADD CONSTRAINT "currencies_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_invited_by_users_id_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_code_id_referral_codes_id_fkey" FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_pricing_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "pricing_plan"("id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_approver_id_users_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_subcategory_id_subcategories_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subcategory_id_subcategories_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_group_id_groups_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_7I2ky2lJcHWg_fkey" FOREIGN KEY ("transaction_schedule_id") REFERENCES "transaction_schedules"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "users_settings" ADD CONSTRAINT "users_settings_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_default_group_id_groups_id_fkey" FOREIGN KEY ("default_group_id") REFERENCES "groups"("id");