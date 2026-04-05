function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function mapUser(row) {
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    isAdmin: Boolean(row.is_admin),
    isSeller: Boolean(row.is_seller),
    seller: Boolean(row.is_seller)
      ? {
          name: row.seller_name || '',
          logo: row.seller_logo || '',
          description: row.seller_description || '',
          rating: Number(row.seller_rating || 0),
          numReviews: Number(row.seller_num_reviews || 0),
        }
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProduct(row, seller = null) {
  return {
    _id: row.id,
    seller: seller || (row.seller_id ? { _id: row.seller_id } : null),
    name: row.name,
    image: row.image,
    brand: row.brand,
    category: row.category,
    description: row.description,
    price: Number(row.price),
    countInStock: Number(row.count_in_stock),
    rating: Number(row.rating),
    numReviews: Number(row.num_reviews),
    reviews: parseJson(row.reviews_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrder(row) {
  return {
    _id: row.id,
    user: row.user_id,
    seller: row.seller_id,
    orderItems: parseJson(row.order_items_json, []),
    shippingAddress: parseJson(row.shipping_address_json, {}),
    paymentMethod: row.payment_method,
    paymentResult: parseJson(row.payment_result_json, null),
    itemsPrice: Number(row.items_price),
    shippingPrice: Number(row.shipping_price),
    taxPrice: Number(row.tax_price),
    totalPrice: Number(row.total_price),
    isPaid: Boolean(row.is_paid),
    paidAt: row.paid_at,
    isDelivered: Boolean(row.is_delivered),
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
