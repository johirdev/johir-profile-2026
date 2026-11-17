// সব API call একজায়গায়
const BASE = "/api/v1/prices"; // ← relative URL, Vercel এ automatically same domain

export const PriceAPI = {
  // GET all
  getAll: async () => {
    const res = await fetch(BASE);
    return res.json();
  },

  // GET one
  getOne: async (id: string) => {
    const res = await fetch(`${BASE}/${id}`);
    return res.json();
  },

  // POST create
  create: async (data: object) => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // cookie পাঠাবে
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // PATCH update
  update: async (id: string, data: object) => {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // DELETE
  remove: async (id: string) => {
    const res = await fetch(`${BASE}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return res.json();
  },
};
