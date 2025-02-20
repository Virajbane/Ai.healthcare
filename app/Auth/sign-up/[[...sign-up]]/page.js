
import Image from 'next/image';
import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="relative flex items-center justify-center h-screen w-screen">
      {/* Background Image */}
      <Image
        src="/city-2601562_1920.jpg" // Ensure the correct path
        alt="Crowded Streets"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        className="absolute inset-0 -z-10"
      />

      {/* Sign-In Component */}
      <div className="flex items-center justify-center">
        <SignUp 
        forceRedirectUrl="/Userpage"/>
      </div>
    </div>
  );
}
