// Regras de validação para o mercado Angolano
export const validateNIF = (nif: string) => {
  // NIF em Angola tem normalmente 9 ou 10 dígitos
  const nifRegex = /^[0-9]{9,10}$/;
  return nifRegex.test(nif);
};

export const validatePassword = (password: string) => {
  // Mínimo 8 caracteres, uma letra e um número
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};