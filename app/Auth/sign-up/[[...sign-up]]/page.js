import Image from 'next/image';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="relative flex items-center justify-center h-screen w-screen">
      {/* Background Image */}
      <Image
        src="/city-2601562_1920.jpg" // Ensure correct path
        alt="Crowded Streets"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        className="absolute inset-0 -z-10"
      />

      {/* Sign-Up Component */}
      <div className="relative z-10 p-6 rounded-lg shadow-lg">
        <SignUp 
          forceRedirectUrl="/Userpage" // Updated from afterSignInUrl
        />
      </div>
    </div>
  );
}
