import { supabase } from './supabase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'petit-kangourou@hotmail.com';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin';
}

// Authentification avec Supabase Auth
export const authService = {
  // Connexion
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user && data.user.email === ADMIN_EMAIL) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            role: 'admin',
          },
          error: null,
        };
      }

      return { user: null, error: 'Accès non autorisé' };
    } catch (error) {
      return { user: null, error: 'Erreur de connexion' };
    }
  },

  // Déconnexion
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'Erreur de déconnexion' };
    }
  },

  // Vérifier la session
  async getSession(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.session && data.session.user.email === ADMIN_EMAIL) {
        return {
          user: {
            id: data.session.user.id,
            email: data.session.user.email,
            role: 'admin',
          },
          error: null,
        };
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: 'Erreur de session' };
    }
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user.email === ADMIN_EMAIL) {
        callback({
          id: session.user.id,
          email: session.user.email,
          role: 'admin',
        });
      } else {
        callback(null);
      }
    });
  },

  // Réinitialiser le mot de passe
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'Erreur lors de la réinitialisation' };
    }
  },

  // Mettre à jour le mot de passe
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'Erreur lors de la mise à jour du mot de passe' };
    }
  },
};
