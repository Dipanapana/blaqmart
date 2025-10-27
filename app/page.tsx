export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">BLAQMART</h1>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Sign In
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">
            Shop Local in Warrenton
          </h2>
          <p className="text-xl mb-8">
            Fast delivery from your favorite vendors. Order now!
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100">
              Browse Products
            </button>
            <button className="px-8 py-3 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-900">
              Become a Vendor
            </button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold mb-8">Featured Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Placeholder for products */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-400">Product Image</span>
            </div>
            <h4 className="font-semibold text-lg mb-2">Product Name</h4>
            <p className="text-gray-600 text-sm mb-3">Store Name</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-green-600">R99.99</span>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">BLAQMART</p>
          <p className="text-gray-400">Building the future of local commerce in Warrenton</p>
          <p className="text-gray-500 text-sm mt-4">© 2025 BLAQMART. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
