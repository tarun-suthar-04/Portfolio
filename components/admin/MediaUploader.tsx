"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkMedia, saveWorkMedia } from "@/app/admin/actions";
import { getUploadSignature } from "@/lib/cloudinary/sign";
import type { Media, Work } from "@/types/work";

const MAX_MEDIA_ITEMS = 30;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

type CloudinaryUpload = {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  duration?: number;
  error?: { message?: string };
};

export function MediaUploader({ work }: { work: Work }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [media, setMedia] = useState(work.media);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(event.target.files ?? []));
    setError("");
    setNotice("");
  }

  async function uploadSelectedFiles() {
    if (!files.length || uploading || deletingId) return;
    if (media.length + files.length > MAX_MEDIA_ITEMS) {
      setError(`A work can have at most ${MAX_MEDIA_ITEMS} media items.`);
      return;
    }

    setUploading(true);
    setError("");
    setNotice("");
    let uploadedCount = 0;
    const failures: string[] = [];

    for (const [index, file] of files.entries()) {
      setProgress(`Uploading ${index + 1} of ${files.length}: ${file.name}`);

      const type = IMAGE_TYPES.has(file.type)
        ? "image"
        : VIDEO_TYPES.has(file.type)
          ? "video"
          : undefined;
      if (!type) {
        failures.push(`${file.name}: choose a JPG, PNG, WebP, GIF, AVIF, MP4, WebM, or MOV file.`);
        continue;
      }
      const maxBytes = type === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
      if (file.size > maxBytes) {
        failures.push(`${file.name}: file exceeds the ${type === "image" ? "10 MB image" : "100 MB video"} limit.`);
        continue;
      }

      try {
        const signature = await getUploadSignature(work.id);
        if ("error" in signature) throw new Error(signature.error);

        const body = new FormData();
        body.append("file", file);
        body.append("api_key", signature.apiKey);
        body.append("timestamp", String(signature.timestamp));
        body.append("signature", signature.signature);
        body.append("folder", signature.folder);

        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signature.cloudName}/${type}/upload`,
          { method: "POST", body }
        );
        const upload = (await uploadResponse.json()) as CloudinaryUpload;
        if (!uploadResponse.ok) {
          throw new Error(upload.error?.message ?? "Cloudinary upload failed.");
        }
        if (
          !upload.secure_url ||
          !upload.public_id ||
          !upload.width ||
          !upload.height
        ) {
          throw new Error("Cloudinary returned incomplete media details.");
        }

        const saved = await saveWorkMedia(work.id, {
          type,
          url: upload.secure_url,
          publicId: upload.public_id,
          width: upload.width,
          height: upload.height,
          duration: upload.duration,
        });
        if ("error" in saved) throw new Error(saved.error);

        setMedia((current) => [...current, saved.media]);
        uploadedCount += 1;
      } catch (uploadError) {
        failures.push(
          `${file.name}: ${uploadError instanceof Error ? uploadError.message : "Upload failed."}`
        );
      }
    }

    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
    setProgress("");
    setUploading(false);
    if (uploadedCount > 0) {
      setNotice(`${uploadedCount} media item${uploadedCount === 1 ? "" : "s"} added.`);
      router.refresh();
    }
    if (failures.length > 0) setError(failures.join(" "));
  }

  async function removeMedia(item: Media) {
    if (uploading || deletingId) return;
    if (!window.confirm(`Permanently delete this ${item.type} from Cloudinary and this work?`)) return;

    setError("");
    setNotice("");
    setDeletingId(item.id);
    try {
      const result = await deleteWorkMedia(work.id, item.id);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setMedia((current) => current.filter((mediaItem) => mediaItem.id !== item.id));
      setNotice("Media removed.");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Couldn't delete this media item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="max-w-xl space-y-4 rounded border border-line p-4" aria-labelledby="media-heading">
      <div>
        <h2 id="media-heading" className="font-display text-lg italic text-ink">
          Media ({media.length})
        </h2>
        <p className="mt-1 text-sm text-graphite">
          Add up to {MAX_MEDIA_ITEMS} images or videos. Images up to 10 MB; videos up to 100 MB.
        </p>
      </div>

      {media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((item) => (
            <MediaPreview
              key={item.id}
              media={item}
              deleting={deletingId === item.id}
              disabled={uploading || (deletingId !== null && deletingId !== item.id)}
              onRemove={() => removeMedia(item)}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded bg-canvas px-3 py-4 text-sm text-graphite">
          No media added yet. A work needs at least one image or video before it can be published.
        </p>
      )}

      <div className="space-y-3">
        <label htmlFor="work-media" className="block text-sm text-graphite">
          Choose images or videos
        </label>
        <input
          ref={inputRef}
          id="work-media"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime"
          multiple
          disabled={uploading || deletingId !== null || media.length >= MAX_MEDIA_ITEMS}
          onChange={selectFiles}
          className="block w-full text-sm text-graphite file:mr-3 file:rounded file:border-0 file:bg-canvas file:px-3 file:py-2 file:text-sm file:text-ink"
        />
        {files.length > 0 && (
          <p className="text-xs text-graphite">{files.length} file(s) selected</p>
        )}
        {progress && <p aria-live="polite" className="text-sm text-graphite">{progress}</p>}
        {notice && <p role="status" className="text-sm text-graphite">{notice}</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button
          type="button"
          onClick={uploadSelectedFiles}
          disabled={uploading || deletingId !== null || files.length === 0 || media.length >= MAX_MEDIA_ITEMS}
          className="rounded border border-line px-4 py-2 text-sm text-ink disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload selected media"}
        </button>
      </div>
    </section>
  );
}

function MediaPreview({
  media,
  deleting,
  disabled,
  onRemove,
}: {
  media: Media;
  deleting: boolean;
  disabled: boolean;
  onRemove: () => void;
}) {
  return (
    <li className="overflow-hidden rounded border border-line bg-canvas">
      <div className="relative bg-black" style={{ aspectRatio: media.aspectRatio }}>
        {media.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.url} alt={media.altText ?? ""} className="h-full w-full object-contain" />
        ) : (
          <video src={media.url} controls preload="metadata" className="h-full w-full object-contain" />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <p className="text-xs capitalize text-graphite">{media.type}</p>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="text-xs text-red-700 underline disabled:opacity-50"
          aria-label={`Delete ${media.type} media`}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </li>
  );
}
