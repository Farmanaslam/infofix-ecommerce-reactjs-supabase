import React, { useState, useEffect } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Tag } from "lucide-react";
import { useStore } from "../context/StoreContext";
import ProductDetails from "./ProductDetails";
import { supabase } from "@/lib/supabaseClient";

interface AvailableCoupon {
  code: string;
  discount_amount: number;
  min_order_amount: number;
  description: string | null;
  product_ids: number[] | null;
}

export const Cart: React.FC = () => {
  const {
    cart,
    products,
    setCurrentPage,
    currentUser,
    updateQuantity,
    removeFromCart,
    addToCart,
  } = useStore();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [allCoupons, setAllCoupons] = useState<AvailableCoupon[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      const { data } = await supabase
        .from("coupons")
        .select("code, discount_amount, min_order_amount, description, product_ids")
        .eq("is_active", true)
        .limit(20);
      if (data) setAllCoupons(data);
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    cart.forEach((item) => {
      const exists = products.some((p) => String(p.id) === String(item.id));
      if (!exists) removeFromCart(String(item.id));
    });
  }, [products]);

  // Get cart product IDs as numbers
  const cartProductIds = cart.map((item) => Number(item.id));

  // Filter coupons: show global ones OR ones whose product_ids intersect with cart
  const applicableCoupons = allCoupons.filter((c) => {
    if (!c.product_ids || c.product_ids.length === 0) return true; // global
    return c.product_ids.some((pid) => cartProductIds.includes(pid));
  });

  // For each coupon, compute which cart products it applies to
  const getCouponApplicableProducts = (coupon: AvailableCoupon) => {
    if (!coupon.product_ids || coupon.product_ids.length === 0) return null; // all
    return cart.filter((item) => coupon.product_ids!.includes(Number(item.id)));
  };

  const handleSelectProduct = (product: any) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedProduct(product);
  };

  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onNavigateToCart={() => setSelectedProduct(null)}
      />
    );
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const cartCategories = [
    ...new Set(cart.map((item) => (item.category ?? "").trim().toLowerCase())),
  ];
  const cartIds = new Set(cart.map((item) => String(item.id)));

  const similarProducts = products
    .filter(
      (p) =>
        cartCategories.includes((p.category ?? "").trim().toLowerCase()) &&
        !cartIds.has(String(p.id))
    )
    .slice(0, 6);

  const recommendedProducts = similarProducts.slice(0, 4);

  if (!currentUser) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <ShoppingCart size={56} className="mx-auto text-indigo-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          Please log in to view your cart
        </h2>
        <p className="text-gray-500 mb-6">
          Your cart is saved to your account so you never lose your items.
        </p>
        <button
          onClick={() => setCurrentPage("login")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-indigo-700 mb-3">Your Shopping Cart</h1>
        <p className="text-gray-600">Review your selected items before proceeding to checkout.</p>
        <p className="text-sm text-gray-500 mt-2">
          Make sure everything looks right. You can update quantities or remove items anytime.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart size={56} className="mx-auto text-indigo-200 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            Your cart is currently empty.
          </h2>
          <p className="text-gray-500 mb-6">
            Browse our refurbished laptops, accessories, and upgrades to continue shopping.
          </p>
          <button
            onClick={() => setCurrentPage("shop")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">Items in Your Cart</h2>
            {cart.map((item) => {
              // Find coupons that apply to this specific item
              const itemCoupons = allCoupons.filter(
                (c) =>
                  c.is_active !== false &&
                  c.product_ids &&
                  c.product_ids.includes(Number(item.id))
              );
              const moq = item.min_order_quantity ?? 1;
              return (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-center gap-6 p-6 border border-indigo-100 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer"
                  onClick={() => handleSelectProduct(item)}
                >
                  <img
                    src={item.image}
                    className="w-24 h-24 object-cover rounded-xl"
                    alt={item.name}
                  />
                  <div className="flex-1 w-full">
                    <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">₹{item.price} per unit</p>

                    {/* Per-item coupon badge */}
                    {itemCoupons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {itemCoupons.map((c) => (
                          <span
                            key={c.code}
                            className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {c.code} — ₹{c.discount_amount} off · Apply at checkout
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const moq = item.min_order_quantity ?? 1;
                          updateQuantity(String(item.id), Math.max(moq, item.quantity - 1));
                        }}
                        disabled={item.quantity <= (item.min_order_quantity ?? 1)}
                        className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-indigo-50 disabled:opacity-40"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold text-lg w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(String(item.id), item.quantity + 1);
                        }}
                        disabled={item.quantity >= (item.stock ?? Infinity)}
                        className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-indigo-50 disabled:opacity-40"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <p className="font-bold text-indigo-600 text-lg">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    {(item.min_order_quantity ?? 1) > 1 && (
                      <p className="text-[11px] text-amber-600 font-semibold">
                        Min order: {item.min_order_quantity} units
                      </p>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(String(item.id));
                      }}
                      className="flex cursor-pointer items-center gap-1 text-red-500 text-sm hover:text-red-600"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Available Coupons — only applicable ones */}
          {applicableCoupons.length > 0 && (
            <div className="mt-8 border border-indigo-100 rounded-2xl overflow-hidden">
              <div className="bg-indigo-50 px-5 py-3 flex items-center gap-2 border-b border-indigo-100">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-black text-indigo-700">
                  Available Coupons for Your Cart
                </span>
                <span className="text-xs text-indigo-400 font-medium ml-auto">
                  Apply at checkout
                </span>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {applicableCoupons.map((c) => {
                  const applicableItems = getCouponApplicableProducts(c);
                  return (
                    <div key={c.code} className="flex items-start gap-4 px-5 py-4">
                      <div className="shrink-0 border-2 border-dashed border-indigo-300 rounded-xl px-3 py-1.5 mt-0.5">
                        <span className="font-black text-indigo-700 text-sm tracking-widest">
                          {c.code}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800">
                          ₹{c.discount_amount} off
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {c.description ||
                            `On orders above ₹${c.min_order_amount > 0 ? c.min_order_amount : 0}`}
                        </p>
                        {/* Show which products this coupon applies to */}
                        {applicableItems && applicableItems.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="text-[10px] text-amber-600 font-black bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                              🎯 For:
                            </span>
                            {applicableItems.map((item) => (
                              <span
                                key={item.id}
                                className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full"
                              >
                                {item.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-indigo-50 px-5 py-2.5 border-t border-indigo-100">
                <p className="text-xs text-indigo-500 font-semibold">
                  💡 You can apply a coupon on the next step during checkout
                </p>
              </div>
            </div>
          )}

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-indigo-700">Customers Also Bought</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Similar products based on your cart
                  </p>
                </div>
                <button
                  onClick={() => setCurrentPage("shop")}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline"
                >
                  View all →
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {similarProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="min-w-42.5 max-w-42.5 border border-indigo-100 rounded-2xl p-4 bg-white hover:shadow-md hover:border-indigo-300 transition cursor-pointer shrink-0"
                  >
                    <div className="relative mb-3">
                      <img
                        src={product.image}
                        className="w-full h-28 object-cover rounded-xl"
                        alt={product.name}
                      />
                      <span className="absolute top-2 left-2 bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm text-gray-800 leading-snug line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-indigo-600 font-bold text-sm mb-3">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-full text-xs border border-indigo-500 text-indigo-600 rounded-lg py-1.5 hover:bg-indigo-50 transition font-medium"
                    >
                      + Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="mt-12 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
            <h3 className="text-xl font-bold text-indigo-700 mb-4">Order Summary</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery Charges</span>
                <span>Based on your location</span>
              </div>
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between text-lg font-bold">
              <span>Total Payable Amount</span>
              <span className="text-indigo-600">₹{total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Final amount will be confirmed before payment.
            </p>
          </div>

          {/* BULK & CORPORATE DISCOUNTS */}
          <div className="mt-8 p-5 border rounded-xl bg-white">
            <h4 className="font-semibold text-indigo-700">🏢 Bulk & Corporate Discounts</h4>
            <p className="text-gray-600 text-sm mt-1">
              Ordering for your business or institution? We offer special pricing on bulk orders
              for corporates, schools, and offices.{" "}
              <button
                onClick={() => setCurrentPage("contact")}
                className="text-indigo-600 underline hover:text-indigo-800 font-medium"
              >
                Contact us to get a quote.
              </button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <span className="text-xl">🚚</span>
            <div>
              <p className="text-sm font-bold text-green-700">Free Delivery</p>
              <p className="text-xs text-green-600">
                Estimated delivery in{" "}
                <span className="font-bold">5–7 business days</span> after order confirmation.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col md:flex-row justify-between gap-4">
            <button
              onClick={() => setCurrentPage("shop")}
              className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-50 transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => setCurrentPage("checkout")}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              Proceed to Checkout
            </button>
          </div>

          {/* Recommended for You */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-indigo-700 mb-2">Recommended for You</h2>
              <p className="text-gray-600 mb-6">
                Based on the items in your cart, you may be interested in these products.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {recommendedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-indigo-100 rounded-xl p-4 hover:shadow-md transition cursor-pointer bg-white"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <img
                      src={product.image}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      alt={product.name}
                    />
                    <h3 className="font-medium text-sm text-gray-800">{product.name}</h3>
                    <p className="text-indigo-600 text-sm font-semibold">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="mt-16 bg-gray-50 p-8 rounded-xl border">
            <h3 className="text-xl font-bold text-indigo-700 mb-4">
              Why Shop with Infofix Computers?
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✔ Secure and encrypted checkout process</li>
              <li>✔ Verified new and certified refurbished products</li>
              <li>✔ Professional in-house servicing and support</li>
              <li>✔ Quality-checked devices by certified technicians</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              Every product is carefully tested to ensure reliable performance and customer
              satisfaction.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
