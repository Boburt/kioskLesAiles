const products = [
  {
    id: 1,
    name: "Лестер Цезарь",
    href: "#",
    price: "20000",
    imageSrc: "",
    imageAlt: "",
  },
  {
    id: 2,
    name: "Лестер Цезарь",
    href: "#",
    price: "20000",
    imageSrc: "",
    imageAlt: "",
  },
  {
    id: 3,
    name: "Лестер Цезарь",
    href: "#",
    price: "20000",
    imageSrc: "",
    imageAlt: "",
  },
  {
    id: 4,
    name: "Лестер Цезарь",
    href: "#",
    price: "20000",
    imageSrc: "",
    imageAlt: "",
  },
  {
    id: 5,
    name: "Лестер Цезарь",
    href: "#",
    price: "20000",
    imageSrc: "",
    imageAlt: "",
  },
  {
    id: 6,
    name: "Лестер Цезарь",
    href: "#",
    price: "20000",
    imageSrc: "",
    imageAlt: "",
  },
  {
    id: 7,
    name: "Лестер Цезарь",
    href: "#",
    price: "20000",
    imageSrc: "",
    imageAlt: "",
  },
  {
    id: 8,
    name: "Лестер Цезарь",
    href: "#",
    price: "20000",
    imageSrc: "",
    imageAlt: "",
  },
  // More products...
];

function Prodcart() {
  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <a key={product.id} href={product.href} className="group">
              <div className="w-full aspect-w-1 aspect-h-1 bg-primary rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8">
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  className="w-full h-full object-center object-cover group-hover:opacity-75"
                />
              </div>
              <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {product.price}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Prodcart;
