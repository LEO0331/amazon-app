const productFixtures = [
  ['Pixel Nova Shirt', 'Shirts', 120, 10, 'Nike', 4.5, 10],
  ['Pixel Drift Shirt', 'Shirts', 100, 20, 'Adidas', 4.0, 10],
  ['Pixel Ember Shirt', 'Shirts', 220, 0, 'Lacoste', 4.8, 17],
  ['Pixel Tide Pant', 'Pants', 78, 15, 'Nike', 4.5, 14],
  ['Pixel Grove Pant', 'Pants', 65, 5, 'Puma', 4.5, 10],
  ['Pixel Pulse Pant', 'Pants', 139, 12, 'Adidas', 4.5, 15],
  ['Pixel Carbon Shoes', 'Shoes', 169, 8, 'Vector', 4.7, 11],
  ['Pixel Sky Shoes', 'Shoes', 189, 9, 'Orbit', 4.6, 13],
  ['Pixel Loop Bag', 'Bags', 95, 14, 'Gridline', 4.4, 12],
  ['Pixel Metro Bag', 'Bags', 115, 11, 'Northstar', 4.5, 16],
  ['Pixel Signal Headphones', 'Electronics', 149, 18, 'Pulse', 4.6, 20],
  ['Pixel Frame Camera', 'Electronics', 199, 7, 'LensLab', 4.7, 9],
  ['Pixel Chrono Watch', 'Accessories', 129, 16, 'Orbit', 4.5, 18],
  ['Pixel Arcade Pad', 'Electronics', 89, 22, 'Vector', 4.3, 15],
  ['Pixel Ridge Jacket', 'Shirts', 175, 10, 'Alpine', 4.8, 21],
  ['Pixel Desk Lamp', 'Accessories', 72, 13, 'Glowhaus', 4.2, 8],
  ['Pixel Pocket Notebook', 'Accessories', 34, 30, 'Draft', 4.4, 11],
  ['Pixel Tile Speaker', 'Electronics', 118, 17, 'Resonant', 4.6, 19],
  ['Pixel Utility Tote', 'Bags', 84, 19, 'CarryCo', 4.5, 14],
  ['Pixel Travel Case', 'Bags', 105, 12, 'Transit', 4.7, 17],
];

const data = {
  products: productFixtures.map(([name, category, price, countInStock, brand, rating, numReviews], index) => {
    const id = String(index + 1);
    return {
      _id: id,
      name,
      category,
      image: `/images/pixel-${id.padStart(2, '0')}.svg`,
      price,
      countInStock,
      brand,
      rating,
      numReviews,
      description: 'high quality product',
    };
  }),
};

export default data;
