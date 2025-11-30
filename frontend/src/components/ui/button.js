export function Button({ children, className, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium bg-pink-500 text-white hover:bg-pink-600 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
