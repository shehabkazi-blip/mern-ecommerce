export default function StarRating({ rating = 0, numReviews }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <svg
          key={s}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill={s <= Math.round(rating) ? '#c8623f' : '#e4ddc9'}
        >
          <path d="M10 1l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.2l6.1-.6L10 1z" />
        </svg>
      ))}
      {numReviews !== undefined && (
        <span className="ml-1 text-xs text-ink/50">({numReviews})</span>
      )}
    </div>
  );
}
