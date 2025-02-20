import Image from 'next/image';
import { SignIn } from '@clerk/nextjs';

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
      <div className="relative   z-10 p-6 rounded-lg shadow-lg">
        <SignIn forceRedirectUrl="/Userpage"
        
         // Force redirection after signing in
      
        appearance={{
              elements: {
                formButtonPrimary: {
                  fontSize: 14,
                  textTransform: 'none',
                  backgroundColor: '#611BBD',
                  '&:hover, &:focus, &:active': {
                    backgroundColor: '#49247A',
                  },
                },
              },
            }}/>
      </div>
    </div>
  );
}
