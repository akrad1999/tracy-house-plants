import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxImageSize = 10 * 1024 * 1024;

type UploadRequestFile = {
  name: string;
  type: string;
  size: number;
  index: number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) {
      return NextResponse.json({ ok: false, message: "Please sign in before using admin tools.", requestId }, { status: 401 });
    }

    if (!(await isAdminUser(supabase, user))) {
      return NextResponse.json({ ok: false, message: "This account is not authorized for admin tools.", requestId }, { status: 403 });
    }

    const body = (await request.json()) as { slug?: string; files?: UploadRequestFile[] };
    const slug = slugify(body.slug ?? "");
    const files = body.files ?? [];

    if (!slug) throw new Error("Slug must contain letters or numbers.");
    if (files.length === 0) throw new Error("Upload at least one plant image.");

    const serviceSupabase = createSupabaseServiceRoleClient();

    const uploads = await Promise.all(
      files.map(async (file) => {
        if (!imageTypes.includes(file.type)) throw new Error("Images must be JPEG, PNG, WebP, or GIF files.");
        if (file.size > maxImageSize) throw new Error("Each image must be 10MB or smaller.");

        const path = `${slug}/${Date.now()}-${file.index}-${sanitizeFileName(file.name)}`;
        const { data, error } = await serviceSupabase.storage.from("plant-images").createSignedUploadUrl(path);

        if (error || !data) throw new Error(error?.message ?? "Unable to create image upload URL.");

        const { data: publicUrl } = serviceSupabase.storage.from("plant-images").getPublicUrl(path);

        return {
          index: file.index,
          path,
          token: data.token,
          publicUrl: publicUrl.publicUrl
        };
      })
    );

    console.info("[admin-image-uploads]", { requestId, slug, uploadCount: uploads.length });

    return NextResponse.json({ ok: true, requestId, uploads });
  } catch (error) {
    console.error("[admin-image-uploads]", {
      requestId,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to prepare image uploads.",
        requestId
      },
      { status: 500 }
    );
  }
}
