import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

/**
 * Fonction Netlify pour maintenir Supabase actif
 * Cette fonction doit être appelée tous les 4 jours par un service externe (cron-job.org)
 * Elle effectue une opération silencieuse sur une table invisible pour éviter
 * la désactivation automatique de Supabase après 7 jours d'inactivité
 */
export const handler: Handler = async (event) => {
  // Autoriser GET et POST
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // @ts-ignore - process.env est disponible dans Netlify Functions
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    // @ts-ignore
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variables Supabase manquantes');
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false, 
          error: 'Configuration Supabase manquante' 
        }),
      };
    }

    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Effectuer un upsert sur la table _keepalive
    const { data, error } = await supabase
      .from('_keepalive')
      .upsert({ 
        id: 'ping', 
        last_ping: new Date().toISOString() 
      })
      .select();

    if (error) {
      console.error('❌ Erreur lors du ping Supabase:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
      };
    }

    console.log('✅ Ping Supabase réussi:', data);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Supabase keepalive ping successful',
        timestamp: new Date().toISOString(),
        data 
      }),
    };
  } catch (error) {
    console.error('❌ Erreur keepalive:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }),
    };
  }
};
