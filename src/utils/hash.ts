import bcrypt from "bcryptjs";

export const hashPassword = async (plain: string) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
};

export const comparePassword = (plain: string, hash: string) => {
    return bcrypt.compare(plain, hash);
};

