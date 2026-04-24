import { useAuth } from "../hooks/useAuth";

const Profile = () => {

const { user } = useAuth()

return (

<div className="min-h-screen bg-[#0f0718] text-white p-10">

<h2 className="text-2xl mb-4">Profile</h2>

<p>Name : {user?.fullName}</p>
<p>Email : {user?.primaryEmailAddress?.emailAddress}</p>

</div>

)

}

export default Profile