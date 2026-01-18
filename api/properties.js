// api/properties.js
export default async function handler(req, res) {
  // Permitir CORS para que n8n pueda llamar
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener parámetros de la query
    const { page = '1', limit = '20', property_id = '' } = req.query;

    // Tu token de Easy Broker (lo configuraremos en Vercel)
    const token = process.env.EASYBROKER_TOKEN;

    if (!token) {
      return res.status(500).json({ 
        error: 'Token no configurado. Agrega EASYBROKER_TOKEN en Variables de Entorno de Vercel' 
      });
    }

    // Construir URL
    let url = 'https://api.easybroker.com/v1/properties';
    
    if (property_id) {
      // Si piden una propiedad específica
      url = `https://api.easybroker.com/v1/properties/${property_id}`;
    } else {
      // Si piden lista de propiedades
      url = `${url}?page=${page}&limit=${limit}`;
    }

    // Hacer la petición a Easy Broker
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Authorization': token,
        'accept': 'application/json'
      }
    });

    // Obtener el resultado
    const data = await response.json();

    // Verificar si hubo error
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Error desde Easy Broker API',
        status: response.status,
        details: data
      });
    }

    // Retornar los datos
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error en proxy:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}
