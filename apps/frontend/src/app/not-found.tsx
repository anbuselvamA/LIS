import Link from 'next/link';

export default function NotFound() {
  // This is a placeholder for the 404 Not Found page.
  // It automatically renders when a user visits a route that does not exist,
  // or when the notFound() function is explicitly called from a server component.
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}
