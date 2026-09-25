import ShopPage from '../shop/page';

export default function AccessoriesPage() {
  return <ShopPage searchParams={Promise.resolve({ category: 'accessories' })} />;
}
