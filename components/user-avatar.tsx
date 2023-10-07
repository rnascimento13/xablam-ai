import { useSession} from "next-auth/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserAvatar = () => {
  const { data: session } = useSession()

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={""/*user?.profileImageUrl*/} />
      <AvatarFallback>
        {session?.user?.name?.charAt(1)}
        {/* {user?.firstName?.charAt(0)} */}
        {/* {user?.lastName?.charAt(0)} */}
      </AvatarFallback>
    </Avatar>
  );
};
