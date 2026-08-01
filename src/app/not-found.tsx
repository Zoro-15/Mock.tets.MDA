import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] text-[#F8FAFC] p-4 text-center">
      <div className="space-y-4 max-w-md">
        <h1 className="text-6xl font-black text-[#3B82F6] tracking-tight">404</h1>
        <h2 className="text-xl font-bold">Page Not Found</h2>
        <p className="text-sm text-[#CBD5E1] leading-relaxed">
          The exam section or page you are trying to access does not exist or has been relocated.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#3B82F6]/90 transition-colors shadow-md shadow-[#3B82F6]/10"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
