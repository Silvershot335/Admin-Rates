const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async (refresh_token: string) => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });
console.log(client_id, client_secret
  )
  return response.json();
};

export async function fetchWithAccessToken(
  refreshToken: string,
  url: string,
  options?: RequestInit,
) {
  const { access_token } = await getAccessToken(refreshToken);
console.log(access_token)
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${access_token}`,
    },
  });
}

export const baseAPI = 'https://api.spotify.com/v1';
