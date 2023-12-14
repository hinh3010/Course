import { auth } from "@clerk/nextjs";

export const currentAccount = async () => {
    const { userId } = auth();

    if (!userId) {
        return null;
    }

    return userId
};
