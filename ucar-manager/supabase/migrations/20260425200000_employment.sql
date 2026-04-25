-- Employment records: tracks post-graduation jobs for employability KPIs
CREATE TABLE student_jobs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  employment_date date NOT NULL,
  job_country    text NOT NULL DEFAULT 'TN',
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_jobs_institution ON student_jobs(institution_id);
CREATE INDEX idx_student_jobs_student    ON student_jobs(student_id);

-- Enforce employment_date >= graduation_date via trigger (CHECK constraints forbid subqueries)
CREATE OR REPLACE FUNCTION check_employment_after_graduation()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  grad_date date;
BEGIN
  SELECT graduation_date INTO grad_date FROM students WHERE id = NEW.student_id;
  IF grad_date IS NOT NULL AND NEW.employment_date < grad_date THEN
    RAISE EXCEPTION 'employment_date (%) must be on or after graduation_date (%)',
      NEW.employment_date, grad_date;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_employment_after_graduation
  BEFORE INSERT OR UPDATE ON student_jobs
  FOR EACH ROW EXECUTE FUNCTION check_employment_after_graduation();

ALTER TABLE student_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_jobs_isolation" ON student_jobs
  FOR ALL USING (is_super_admin() OR institution_id = auth_institution_id());

-- v_employment_kpis:
--   employability_rate  = graduated students with a job / total graduated students (%)
--   avg_days_to_employ  = average days between graduation_date and employment_date
CREATE VIEW v_employment_kpis AS
SELECT
  s.institution_id,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated')          AS total_graduated,
  COUNT(DISTINCT j.student_id)                                         AS employed_count,
  ROUND(
    COUNT(DISTINCT j.student_id)::numeric
    / NULLIF(COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'graduated'), 0)
    * 100, 1
  )                                                                    AS employability_rate,
  ROUND(
    AVG(j.employment_date - s.graduation_date) FILTER (WHERE j.student_id IS NOT NULL)
  )                                                                    AS avg_days_to_employ
FROM students s
LEFT JOIN student_jobs j ON j.student_id = s.id
GROUP BY s.institution_id;
