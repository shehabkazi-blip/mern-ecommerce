const mongoose = require('mongoose');
const slugify = require('slugify');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: [true, 'Description is required'] },
    brand: { type: String, default: 'Generic' },
    category: { type: String, required: [true, 'Category is required'], index: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, min: 0 },
    countInStock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', category: 'text' });

productSchema.pre('validate', function generateSlug(next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  next();
});

productSchema.methods.recalculateRating = function recalculateRating() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.rating = Math.round((total / this.reviews.length) * 10) / 10;
  this.numReviews = this.reviews.length;
};

module.exports = mongoose.model('Product', productSchema);
