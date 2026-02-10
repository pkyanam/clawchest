export function Footer() {
  return (
    <footer className="border-t mt-auto bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Clawchest Store. All rights reserved.
      </div>
    </footer>
  );
}
