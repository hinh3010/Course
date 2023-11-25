import { currentUser, redirectToSignIn } from "@clerk/nextjs";

export const initialAccount = async () => {
    const user = await currentUser();

    if (!user) {
        return redirectToSignIn();
    }

    return user;
};
