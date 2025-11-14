CREATE TYPE "public"."audit_log_action" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."feedback_status_enum" AS ENUM('pending', 'inprogress', 'complete', 'incomplete');--> statement-breakpoint
CREATE TYPE "public"."feedback_type_enum" AS ENUM('feature', 'general', 'testimonial', 'issue');--> statement-breakpoint
CREATE TYPE "public"."fileType" AS ENUM('image', 'document', 'video', 'audio');--> statement-breakpoint
CREATE TABLE "account_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"type" integer NOT NULL,
	"name" text,
	"balance" numeric DEFAULT '0.00' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"use_for_net_worth" boolean DEFAULT true NOT NULL,
	"monthly_budget" numeric,
	"is_private" boolean DEFAULT false NOT NULL,
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
	"id" text PRIMARY KEY NOT NULL,
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
	"id" text PRIMARY KEY NOT NULL,
	"entity" varchar(100) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"creator_id" varchar(100) NOT NULL,
	"action" "audit_log_action" NOT NULL,
	"previous_data" jsonb DEFAULT '{}'::jsonb,
	"updated_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "balance_transfer_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"from_account_id" text NOT NULL,
	"to_account_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"title" text,
	"note" text,
	"category_id" integer,
	"subcategory_id" integer,
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
	"id" text PRIMARY KEY NOT NULL,
	"from_account_id" text NOT NULL,
	"to_account_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"title" text,
	"note" text,
	"committed_at" timestamp with time zone NOT NULL,
	"out_transaction_id" text,
	"in_transaction_id" text,
	"category_id" integer,
	"subcategory_id" integer,
	"creator_id" text,
	"group_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"color" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"group_id" text,
	"parent_id" integer
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"feedback_text" text NOT NULL,
	"feedback_type" "feedback_type_enum",
	"status" "feedback_status_enum" DEFAULT 'pending',
	"active_page" text,
	"file_urls" text[],
	"creator_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" text PRIMARY KEY NOT NULL,
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
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"group_id" text NOT NULL,
	"role_id" text,
	"invited_by" text NOT NULL,
	"invited_on" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_on" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"user_id" text NOT NULL,
	"group_id" text NOT NULL,
	"role_id" text,
	CONSTRAINT "memberships_user_id_group_id_pk" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "news_tickers" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"ticker_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pricing_plan" (
	"id" text PRIMARY KEY NOT NULL,
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
	"id" text PRIMARY KEY NOT NULL,
	"referral_code_id" text NOT NULL,
	"referred_id" text,
	"points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"group_id" text NOT NULL,
	"referral_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "referral_codes_referralCode_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"group_id" text,
	"permissions" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "storage" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text,
	"url" text,
	"type" "fileType" DEFAULT 'image',
	"extension" text,
	"size" integer DEFAULT 0,
	"group_id" text NOT NULL,
	"uploaded_by" text,
	"entity_name" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
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
	"history" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transaction_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"title" text,
	"note" text,
	"is_outgoing" boolean DEFAULT true NOT NULL,
	"category_id" integer,
	"subcategory_id" integer,
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
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"title" text,
	"note" text,
	"is_outgoing" boolean DEFAULT true NOT NULL,
	"category_id" integer,
	"subcategory_id" integer,
	"committed_at" timestamp with time zone NOT NULL,
	"creator_id" text,
	"group_id" text NOT NULL,
	"scheduled_transaction_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users_settings" (
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "users_settings_user_id_key_pk" PRIMARY KEY("user_id","key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
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
	"updated_at" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_type_account_types_id_fk" FOREIGN KEY ("type") REFERENCES "public"."account_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_from_account_id_accounts_id_fk" FOREIGN KEY ("from_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_subcategory_id_categories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfer_schedules" ADD CONSTRAINT "balance_transfer_schedules_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_from_account_id_accounts_id_fk" FOREIGN KEY ("from_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_out_transaction_id_transactions_id_fk" FOREIGN KEY ("out_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_in_transaction_id_transactions_id_fk" FOREIGN KEY ("in_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_subcategory_id_categories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfers" ADD CONSTRAINT "balance_transfers_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_code_id_referral_codes_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_codes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_pricing_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."pricing_plan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_subcategory_id_categories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_schedules" ADD CONSTRAINT "transaction_schedules_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subcategory_id_categories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_scheduled_transaction_id_transaction_schedules_id_fk" FOREIGN KEY ("scheduled_transaction_id") REFERENCES "public"."transaction_schedules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_settings" ADD CONSTRAINT "users_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_default_group_id_groups_id_fk" FOREIGN KEY ("default_group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "adminEmailUniqueIndex" ON "admins" USING btree (lower("email"));