#!/bin/sh

set -e

echo "⏳ Waiting for product-service..."
until curl -s http://product-service:3000/health > /dev/null; do
  sleep 2
done

echo "⏳ Waiting for order-service..."
until curl -s http://order-service:3000/health > /dev/null; do
  sleep 2
done

echo "⏳ Waiting for user-service..."
until curl -s http://user-service:3000/health > /dev/null; do
  sleep 2
done

echo "✅ All services are up. Starting Nginx..."
exec nginx -g 'daemon off;'
