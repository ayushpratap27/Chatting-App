import { useAppStore } from "@/store"

function Profile() {
  const { userInfo } = useAppStore();
  return (
    <div>
      <div>Email: {userInfo.email}</div>
    </div>
  )
}

export default Profile;