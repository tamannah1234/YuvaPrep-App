import { useUser } from "@clerk/clerk-react";

export const useAuth = () => {

const { user, isSignedIn } = useUser();

return {
user,
isSignedIn
};

};