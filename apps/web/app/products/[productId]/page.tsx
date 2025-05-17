'use client'
import { use } from 'react';
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { IProduct } from "@/Helpers/Interfaces";
import QuantityField from "@/components/QuantityField";
import { CartContext } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function Product({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      if (!productId) throw new Error("Product ID is undefined");

      // TODO: Replace with your real API endpoint
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !product) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto h-full px-4 sm:px-0 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full items-center">
        <Carousel
          autoPlay={false}
          showArrows={false}
          showStatus={false}
          swipeable={true}
          showIndicators={false}
          renderThumbs={() => product.images.map((img, idx) => (
            <div key={idx} className="w-full h-10 relative">
              <Image src={img} layout="fill" objectFit="cover" alt="product thumb"></Image>
            </div>
          ))
          }
        >
          {product.images.map((image, index) => (
            <Image src={image} key={index} alt={`Product image ${index + 1}`} width={500} height={500} style={{ maxHeight: '50vh', objectFit: 'contain' }} />
          ))}
        </Carousel>
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h2 className="text-5xl">{product.name}</h2>
          <div className="flex items-center gap-4">
            <h4 className="text-3xl">${product.price.toFixed(2)}</h4>
            <p className="text-sm text-muted-foreground">{product.orderCount} sold</p>
          </div>
          <div>
            Stock:
            <span className={product.stock === 0 ? "text-red-500" : "text-green-500"}>
              {product.stock === 0 ? " Out of stock" : ` ${product.stock} in stock`}
            </span>
          </div>
          <p>{product.description}</p>
          <QuantityField quantity={quantity} max={product.stock} setQuantity={setQuantity} />
          <div className="flex gap-3 my-4">
            <Button
              variant="outline"
              onClick={() => addToCart(product.id, quantity)}
              disabled={product.stock === 0}
            >
              Add To Cart <ShoppingCart />
            </Button>
            <Button
              onClick={() => router.push(`/checkout?productId=${product.id}&quantity=${quantity}`)}
              disabled={product.stock === 0}
            >
              Buy Now <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
