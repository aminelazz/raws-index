"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";

import { CreateDownloadToken } from "./actions";

type Props = {
  file: z.infer<typeof Schema_File>;
};
export default function PreviewImage({ file }: Props) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        if (!file.encryptedWebContentLink) {
          setError("No image to preview");
          return;
        }
        const token = await CreateDownloadToken();
        await fetch(`/api/download/${file.encryptedId}?token=${token}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch image");
            return res.blob();
          })
          .then((blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              setImgSrc(reader.result as string);
            };
            reader.onerror = (e) => {
              console.error(e);
              setError(
                "Could not preview this image, try downloading the file",
              );
            };
            reader.readAsDataURL(blob);
          })
          .catch((e) => {
            console.error(e.message);
            setError(e.message);
          });
      } catch (error) {
        const e = error as Error;
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [file]);

  return (
    <div className='flex min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <div
          className={cn(
            "h-auto min-h-[50dvh] w-full",
            "flex flex-grow flex-col items-center justify-center gap-3",
          )}
        >
          <Icon
            name='LoaderCircle'
            size={32}
            className='animate-spin text-foreground'
          />
          <p>Loading image...</p>
        </div>
      ) : error ? (
        <div className='flex h-full flex-col items-center justify-center gap-3'>
          <Icon
            name='CircleX'
            size={24}
            className='text-destructive'
          />
          <span className='text-center text-destructive'>{error}</span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={file.name}
          className='max-h-[70dvh] w-full rounded-[var(--radius)] bg-muted object-contain object-center'
        />
      )}
    </div>
  );
}
