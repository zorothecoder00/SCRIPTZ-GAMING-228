type AuthResult = { error: { message?: string; code?: string } | null };

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou mot de passe incorrect.',
  INVALID_EMAIL: 'Adresse e-mail invalide.',
};

// Branche un formulaire d'auth : envoi, gestion d'erreur, puis redirection.
export function handleAuthForm(formId: string, submit: (data: FormData) => Promise<AuthResult>) {
  const form = document.getElementById(formId) as HTMLFormElement;
  const errorBox = document.getElementById('form-error')!;
  const button = form.querySelector('button[type="submit"]') as HTMLButtonElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');
    button.disabled = true;

    try {
      const { error } = await submit(new FormData(form));
      if (error) {
        errorBox.textContent = (error.code && MESSAGES[error.code]) || error.message || 'Une erreur est survenue.';
        errorBox.classList.remove('hidden');
        return;
      }
      const redirect = new URLSearchParams(location.search).get('redirect');
      location.href = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/admin';
    } catch {
      errorBox.textContent = 'Impossible de joindre le serveur. Réessaie.';
      errorBox.classList.remove('hidden');
    } finally {
      button.disabled = false;
    }
  });
}
