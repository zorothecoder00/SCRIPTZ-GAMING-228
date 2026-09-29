// Côté navigateur : redimensionne l'image puis l'envoie à /api/upload (Vercel Blob).

const MAX_SIDE = 1600;

/** Réduit l'image (côté max 1600 px) et la convertit en WebP. SVG et GIF sont envoyés tels quels. */
async function shrink(file: File): Promise<File> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP garde la transparence (logos PNG).
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
}

export function initImageUploads() {
  document.querySelectorAll<HTMLElement>('[data-image-upload]').forEach((wrapper) => {
    const input = wrapper.querySelector<HTMLInputElement>('input[type="url"]')!;
    const picker = wrapper.querySelector<HTMLInputElement>('input[type="file"]')!;
    const status = wrapper.querySelector<HTMLElement>('[data-status]')!;
    const preview = wrapper.querySelector<HTMLImageElement>('[data-preview]')!;
    const submit = input.form?.querySelector<HTMLButtonElement>('button[type="submit"]');

    const showPreview = () => {
      const ok = /^https?:\/\//i.test(input.value);
      preview.hidden = !ok;
      if (ok) preview.src = input.value;
    };
    input.addEventListener('change', showPreview);

    picker.addEventListener('change', async () => {
      const file = picker.files?.[0];
      if (!file) return;

      status.textContent = 'Envoi en cours…';
      status.className = 'text-sm text-zinc-400';
      if (submit) submit.disabled = true;

      try {
        const body = new FormData();
        body.append('file', await shrink(file));
        body.append('folder', wrapper.dataset.folder ?? 'divers');
        const res = await fetch('/api/upload', { method: 'POST', body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error(data.error ?? `Erreur ${res.status}`);

        input.value = data.url;
        showPreview();
        status.textContent = 'Image envoyée ✔ — pense à enregistrer.';
        status.className = 'text-sm text-neon-green';
      } catch (e) {
        status.textContent = e instanceof Error ? e.message : "Échec de l'envoi.";
        status.className = 'text-sm text-neon-pink';
      } finally {
        picker.value = '';
        if (submit) submit.disabled = false;
      }
    });
  });
}
