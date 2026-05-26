const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getErrorFromResponse(res: Response, defaultMessage: string): Promise<Error> {
  try {
    const error = await res.json();
    if (error.message) {
      if (Array.isArray(error.message)) {
        return new Error(error.message.join('\n'));
      }
      return new Error(error.message);
    }
    if (error.error?.message) {
      return new Error(error.error.message);
    }
  } catch {
    /* ignore and fall back */
  }
  return new Error(defaultMessage);
}

export async function submitApplication(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw await getErrorFromResponse(res, 'Failed to submit application');
  }

  return res.json();
}

export async function trackApplication(appNumber: string) {
  const res = await fetch(`${API_BASE}/api/applications/track/${appNumber}`);

  if (!res.ok) {
    throw await getErrorFromResponse(res, 'Application not found');
  }

  return res.json();
}

export async function getAdminStats() {
  const res = await fetch(`${API_BASE}/api/admin/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getApplications(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/admin/applications?${query}`);
  if (!res.ok) throw new Error('Failed to fetch applications');
  return res.json();
}

export async function getApplicationScore(id: string) {
  const res = await fetch(`${API_BASE}/api/applications/${id}/score`);
  if (!res.ok) throw new Error('Failed to fetch score');
  return res.json();
}

export async function updateApplicationStatus(
  id: string,
  data: { status: string; reason?: string },
) {
  const res = await fetch(`${API_BASE}/api/applications/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}
