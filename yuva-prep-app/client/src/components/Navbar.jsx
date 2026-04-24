import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {

const { user } = useAuth()

return (

<nav className="sticky top-0 z-20 flex items-center justify-between px-10 py-4 bg-[#0a010f]/90 backdrop-blur border-b border-[#AD49E1]/20">

<Link to="/" className="text-2xl font-medium tracking-tight">
Yuva<span className="text-[#AD49E1]">Prep</span>
</Link>

<div className="flex gap-6 text-white/60">

<Link to="/sessions">Sessions</Link>

{user ? (
<Link to="/profile">Profile</Link>
) : (
<>
<Link to="/login">Login</Link>
<Link to="/signup">Signup</Link>
</>
)}

</div>

</nav>

)

}

export default Navbar