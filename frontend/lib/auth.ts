export const getUser = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("fg_user") || "null"); }
  catch { return null; }
};

export const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("fg_token") : null;

export const setAuth = (token: string, user: object) => {
  localStorage.setItem("fg_token", token);
  localStorage.setItem("fg_user", JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem("fg_token");
  localStorage.removeItem("fg_user");
  window.location.href = "/login";
};

export const isLoggedIn = () => !!getToken();
