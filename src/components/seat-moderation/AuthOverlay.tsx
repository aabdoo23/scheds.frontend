import { GoogleLogin } from '@react-oauth/google';
import { useAuthContext } from '@/contexts/AuthContext';

export function AuthOverlay() {
  const { handleGoogleSuccess } = useAuthContext();

  const onSuccess = (res: { credential?: string }) => {
    if (res.credential) handleGoogleSuccess(res.credential);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="bg-[var(--lighter-dark)] p-10 rounded-xl text-center max-w-[400px] border border-white/10">
        <i className="fas fa-lock text-5xl text-[#dc3545] mb-5" />
        <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2.5">
          Authentication Required
        </h3>
        <p className="text-[var(--dark-text)] m-0 mb-5">
          Sign in with Google to access seat monitoring
        </p>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={onSuccess}
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>
      </div>
    </div>
  );
}
