import { hash, compare } from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const hashedPassword = await hash(password, 12);
  return hashedPassword;
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await compare(password, hash);
};