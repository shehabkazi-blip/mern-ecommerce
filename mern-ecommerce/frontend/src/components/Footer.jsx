export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/8 bg-sand/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-xl font-semibold">Fieldstock</p>
            <p className="mt-2 text-sm text-ink/60">Everyday goods, well made.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Shop</p>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              <li>All products</li>
              <li>Electronics</li>
              <li>Home &amp; kitchen</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              <li>Shipping &amp; returns</li>
              <li>Order tracking</li>
              <li>Contact us</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-ink/70">
              <li>About</li>
              <li>Terms</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-ink/40">© {new Date().getFullYear()} Fieldstock. All rights reserved.</p>
      </div>
    </footer>
  );
}
