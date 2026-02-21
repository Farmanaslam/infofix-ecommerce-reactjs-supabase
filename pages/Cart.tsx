import React from "react";
import { useStore } from "../context/StoreContext";
import { Plus, Minus, Trash2 } from "lucide-react";
export const Cart: React.FC = () => {
  const { cart, products, setCurrentPage, updateQuantity, removeFromCart } =
    useStore();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const relatedProducts = products
    .filter((product) =>
      cart.some(
        (item) => item.category === product.category && item.id !== product.id,
      ),
    )
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-indigo-700 mb-3">
          Your Shopping Cart
        </h1>
        <p className="text-gray-600">
          Review your selected items before proceeding to checkout.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Make sure everything looks right. You can update quantities or remove
          items anytime.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            Your cart is currently empty.
          </h2>
          <p className="text-gray-500 mb-6">
            Browse our refurbished laptops, accessories, and upgrades to
            continue shopping.
          </p>

          <button
            onClick={() => setCurrentPage("products")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">
              Items in Your Cart
            </h2>
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-center gap-6 p-6 border border-indigo-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Product Image */}
                <img
                  src={item.image}
                  className="w-24 h-24 object-cover rounded-xl"
                  alt={item.name}
                />

                {/* Product Details */}
                <div className="flex-1 w-full">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {item.name}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    ₹{item.price} per unit
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-indigo-50 disabled:opacity-40"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="font-semibold text-lg w-6 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-indigo-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Price + Remove */}
                <div className="flex flex-col items-end gap-4">
                  <p className="font-bold text-indigo-600 text-lg">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1 text-red-500 text-sm hover:text-red-600"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
            <h3 className="text-xl font-bold text-indigo-700 mb-4">
              Order Summary
            </h3>

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
          <div className="mt-8 p-5 border rounded-xl bg-white">
            <h4 className="font-semibold text-indigo-700">
              Easy EMI Available
            </h4>
            <p className="text-gray-600 text-sm mt-1">
              EMI options will be shown during checkout based on your selected
              payment method and tenure.
            </p>
          </div>
          <div className="mt-10 flex flex-col md:flex-row justify-between gap-4">
            <button
              onClick={() => setCurrentPage("products")}
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

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-indigo-700 mb-2">
                Recommended for You
              </h2>
              <p className="text-gray-600 mb-6">
                Based on the items in your cart, you may be interested in these
                products.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-indigo-100 rounded-xl p-4 hover:shadow-md transition cursor-pointer bg-white"
                    onClick={() => setCurrentPage("products")}
                  >
                    <img
                      src={product.image}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      alt={product.name}
                    />
                    <h3 className="font-medium text-sm text-gray-800">
                      {product.name}
                    </h3>
                    <p className="text-indigo-600 text-sm font-semibold">
                      ${product.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              Every product is carefully tested to ensure reliable performance
              and customer satisfaction.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
