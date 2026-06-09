const API_BASE_URL = 'http://localhost:5062';

export async function getGames() {
  const response = await fetch(`${API_BASE_URL}/games`);
  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }
  return response.json();
}

export async function getGame(id) {
  const response = await fetch(`${API_BASE_URL}/games/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch game with id ${id}`);
  }
  return response.json();
}

export async function createGame(game) {
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(game),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.title || 'Failed to create game';
    const errors = errorData?.errors || {};
    throw { message, errors };
  }
  return response.json();
}

export async function updateGame(id, game) {
  const response = await fetch(`${API_BASE_URL}/games/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(game),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.title || 'Failed to update game';
    const errors = errorData?.errors || {};
    throw { message, errors };
  }
  return true;
}

export async function deleteGame(id) {
  const response = await fetch(`${API_BASE_URL}/games/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete game with id ${id}`);
  }
  return true;
}

export async function getGenres() {
  const response = await fetch(`${API_BASE_URL}/genres`);
  if (!response.ok) {
    throw new Error('Failed to fetch genres');
  }
  return response.json();
}
