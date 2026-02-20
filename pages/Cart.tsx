import React from "react";
import { useStore } from "../context/StoreContext";

export const Cart: React.FC = () => {
  const { cart, products, setCurrentPage } = useStore();

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
      <h1 className="text-3xl font-bold text-indigo-700 mb-10">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-5">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-6 p-4 border border-indigo-100 rounded-xl bg-white shadow-sm"
              >
                <img
                  src={item.image}
                  className="w-20 h-20 object-cover rounded-lg"
                  alt={item.name}
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    ${item.price} × {item.quantity}
                  </p>
                </div>

                <div className="font-semibold text-indigo-600 text-lg">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Total + Checkout */}
          <div className="mt-10 flex justify-between items-center border-t border-indigo-100 pt-6">
            <div className="text-2xl font-bold text-gray-800">
              Total:{" "}
              <span className="text-indigo-600">${total.toFixed(2)}</span>
            </div>

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
              <h2 className="text-2xl font-bold text-indigo-700 mb-6">
                You May Also Like
              </h2>

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
        </>
      )}
    </div>
  );
};
