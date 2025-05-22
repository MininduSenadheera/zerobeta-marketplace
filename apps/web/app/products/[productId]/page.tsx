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
import axios from 'axios';
import config from '@/Helpers/config';
import { AuthContext } from '@/context/AuthContext';

function Product({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<IProduct>(config.apiUrl + 'products/by-id/' + productId)
        setProduct(response.data)
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);


  if (isLoading || !product) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="container mx-auto h-screen px-4 sm:px-0 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 h-full items-center">
        <Carousel
          autoPlay={false}
          showArrows={false}
          showStatus={false}
          swipeable={true}
          showIndicators={false}
          renderThumbs={() => Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full h-10 relative">
              <Image src='/images/product.png' layout="fill" objectFit="cover" alt={`Thumbnail ${index + 1}`}></Image>
            </div>
          ))
          }
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Image src='/images/product.png' key={index} alt={`Product image ${index + 1}`} width={500} height={0} className="object-contain max-h-[50vh] w-full" />
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
          <h2 className="text-4xl font-semi-bold">{product.name}</h2>
          <div className="flex items-center gap-4">
            <h4 className="text-3xl font-bold">${product.price.toFixed(2)}</h4>
            <p className="text-sm text-muted-foreground">{product.orderCount} sold</p>
          </div>
          <div>
            Stock:
            <span className={isOutOfStock ? "text-red-500" : "text-green-500 font-medium"}>
              {isOutOfStock ? " Out of stock" : ` ${product.stock} in stock`}
            </span>
          </div>
          <p className="text-muted-foreground">{product.description}</p>
          <p className="text-sm text-muted-foreground mb-0">
            Seller: {product.seller.firstname} {product.seller.lastname}
          </p>
          <p className="text-sm text-muted-foreground">
            From: {product.seller.country}
          </p>
          <QuantityField quantity={quantity} max={product.stock} setQuantity={setQuantity} />
          {user?.userRole === 'Seller' && (
            <p className="text-red-500">Sellers cant purchase products</p>
          )}
          <div className="flex gap-3 my-4">
            <Button
              variant="outline"
              onClick={() => addToCart(product.id, quantity)}
              disabled={isOutOfStock || user?.userRole === 'Buyer'}
            >
              Add To Cart <ShoppingCart />
            </Button>
            <Button
              onClick={() => router.push(`/checkout?productId=${product.id}&quantity=${quantity}`)}
              disabled={isOutOfStock || user?.userRole === 'Buyer'}
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
