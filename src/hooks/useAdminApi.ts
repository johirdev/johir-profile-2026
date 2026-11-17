const BASE = "/api/v1/admins";

export const AdminAPI = {
  // GET all (token লাগবে)
  getAll: async (token: string) => {
    const res = await fetch(BASE, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // GET one
  getOne: async (id: string, token: string) => {
    const res = await fetch(`${BASE}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // POST login (token লাগবে না)
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // cookie set হবে
      body: JSON.stringify({ admin_email: email, admin_password: password }),
    });
    return res.json();
  },

  // POST create (superadmin token লাগবে)
  create: async (data: object, token: string) => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // PATCH update
  update: async (id: string, data: object, token: string) => {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // DELETE
  remove: async (id: string, token: string) => {
    const res = await fetch(`${BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
