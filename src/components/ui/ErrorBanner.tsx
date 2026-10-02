export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="my-8 mx-auto max-w-2xl px-5 py-4 border border-line rounded-card text-ink text-center">
      {message}
    </div>
  );
}
