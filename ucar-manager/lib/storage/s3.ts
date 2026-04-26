import { createClient } from "@supabase/supabase-js";

type UploadToS3Input = {
  fileBuffer: Buffer;
  contentType: string;
  originalFileName: string;
  institutionId: string;
  userId: string;
};

type UploadToS3Result = {
  bucket: string;
  key: string;
  url: string;
};

export async function uploadToS3(input: UploadToS3Input): Promise<UploadToS3Result> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key on server side to bypass RLS policies
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.S3_BUCKET || "documents";
  const keyPrefix = process.env.S3_KEY_PREFIX || "raw-uploads";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const safeFileName = input.originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = [
    keyPrefix,
    input.institutionId,
    `${Date.now()}-${input.userId}-${safeFileName}`,
  ].join("/");

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(key, input.fileBuffer, {
        contentType: input.contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error("Upload returned no data");
    }

    // Build public URL using the service role client
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(key);

    return {
      bucket,
      key,
      url: publicUrl,
    };
  } catch (error: any) {
    console.error("[Supabase Upload Error]", {
      message: error.message,
      bucket,
      key,
      institutionId: input.institutionId,
    });
    throw error;
  }
}
