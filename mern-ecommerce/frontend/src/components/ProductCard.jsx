import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Link to={`/products/${product.slug || product._id}`} className="group block">
      <div className="card overflow-hidden">
        <div className="aspect-square overflow-hidden bg-sand/50">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-ink/45">{product.category}</p>
          <h3 className="mt-1 truncate font-medium text-ink">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-semibold text-ink">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-ink/40 line-through">${product.price.toFixed(2)}</span>
            )}
          </div>
          {product.countInStock === 0 && (
            <p className="mt-1 text-xs font-semibold text-clay">Out of stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
