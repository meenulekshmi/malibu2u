import ShopPage from '../shop/page';

export default function ConsolesPage() {
  return <ShopPage searchParams={Promise.resolve({ category: 'consoles' })} />;
}
