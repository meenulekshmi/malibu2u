import ShopPage from '../shop/page';

export default function DealsPage() {
  return <ShopPage searchParams={Promise.resolve({ sort: 'price_asc' })} />;
}
