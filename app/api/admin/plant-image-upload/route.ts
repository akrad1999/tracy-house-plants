import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxImageSize = 10 * 1024 * 1024;

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
  let stage = "start";

  try {
    stage = "auth";
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    if (!user) {
      return NextResponse.json({ ok: false, message: "Please sign in before using admin tools.", stage, requestId }, { status: 401 });
    }

    if (!(await isAdminUser(supabase, user))) {
      return NextResponse.json({ ok: false, message: "This account is not authorized for admin tools.", stage, requestId }, { status: 403 });
    }

    stage = "parse-form";
    const formData = await request.formData();
    const slug = slugify(String(formData.get("slug") ?? ""));
    const index = Number.parseInt(String(formData.get("index") ?? "0"), 10);
    const image = formData.get("image");

    if (!slug) throw new Error("Slug must contain letters or numbers.");
    if (!(image instanceof File) || image.size === 0) throw new Error("Missing image file.");
    if (!imageTypes.includes(image.type)) throw new Error("Images must be JPEG, PNG, WebP, or GIF files.");
    if (image.size > maxImageSize) throw new Error("Each image must be 10MB or smaller.");

    stage = "upload";
    const serviceSupabase = createSupabaseServiceRoleClient();
    const path = `${slug}/${Date.now()}-${Number.isFinite(index) ? index : 0}-${sanitizeFileName(image.name)}`;
    const { error: uploadError } = await serviceSupabase.storage.from("plant-images").upload(path, image, {
      contentType: image.type,
      upsert: false
    });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrl } = serviceSupabase.storage.from("plant-images").getPublicUrl(path);
    console.info("[admin-image-upload-fallback]", { requestId, path, size: image.size, type: image.type });

    return NextResponse.json({
      ok: true,
      requestId,
      image: {
        index: Number.isFinite(index) ? index : 0,
        src: publicUrl.publicUrl,
        storagePath: path
      }
    });
  } catch (error) {
    console.error("[admin-image-upload-fallback]", {
      requestId,
      stage,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to upload image.",
        stage,
        requestId
      },
      { status: 500 }
    );
  }
}
