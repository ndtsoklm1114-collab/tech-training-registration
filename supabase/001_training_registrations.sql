-- 建立 training_registrations 資料表
CREATE TABLE IF NOT EXISTS training_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  title TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  session TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE training_registrations ENABLE ROW LEVEL SECURITY;

-- 所有人可以 INSERT（報名）
CREATE POLICY "Allow public insert"
  ON training_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 所有人可以 SELECT（查詢場次人數）
CREATE POLICY "Allow public select"
  ON training_registrations
  FOR SELECT
  TO anon
  USING (true);

-- 所有人可以 DELETE（由 API route 驗證密碼後執行）
CREATE POLICY "Allow public delete"
  ON training_registrations
  FOR DELETE
  TO anon
  USING (true);
