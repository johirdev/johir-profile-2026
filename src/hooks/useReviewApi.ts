const BASE = "/api/v1/reviews";

export const ReviewAPI = {
  // GET all (public)
  getAll: async () => {
    const res = await fetch(BASE);
    return res.json();
  },

  // GET one (public)
  getOne: async (id: string) => {
    const res = await fetch(`${BASE}/${id}`);
    return res.json();
  },

  // POST create (admin)
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

  // PATCH update (admin)
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

  // DELETE (admin)
  remove: async (id: string, token: string) => {
    const res = await fetch(`${BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
