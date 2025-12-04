-- =============================================================================
-- Supabase Gather Database Setup
-- =============================================================================

-- profiles テーブル作成
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_type TEXT NOT NULL DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles テーブルの updated_at トリガー
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- Row Level Security (RLS) 設定
-- =============================================================================

-- profiles テーブルの RLS を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロフィールのみ読み書き可能
CREATE POLICY "Users can read their own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ゲストユーザー向け：全てのプロフィールが読み取り専用で閲覧可能
-- （ゲストはauth.uid()がnullのため、上記ポリシーに該当しない）
CREATE POLICY "Anyone can read all profiles"
    ON profiles
    FOR SELECT
    USING (true);

-- =============================================================================
-- プロフィール自動作成関数
-- =============================================================================

-- Google ログイン時にプロフィールを自動作成する関数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, avatar_type)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous'),
        'default'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ユーザー作成時にプロフィール自動作成トリガー
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- インデックス
-- =============================================================================

-- プロフィール検索用インデックス
CREATE INDEX idx_profiles_name ON profiles(name);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- =============================================================================
-- 初期データ（任意）
-- =============================================================================

-- 開発用のテストプロフィール
-- INSERT INTO profiles (id, name, avatar_type)
-- SELECT 
--     '00000000-0000-0000-0000-000000000000'::uuid,
--     'Test User',
--     'default'
-- WHERE NOT EXISTS (
--     SELECT 1 FROM profiles WHERE id = '00000000-0000-0000-0000-000000000000'::uuid
-- );